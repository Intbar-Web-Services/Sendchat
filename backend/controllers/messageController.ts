import mongoose from "mongoose";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Token from "../models/tokenModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";
import { messaging } from "../services/firebase.js";
import LoggedInUserRequest from "../contracts/loggedInUser.js";
import { Request, Response } from "express";

async function subscribe(req: LoggedInUserRequest, res: any) {
	try {
		const user = req.user;
		const { token, oldToken } = req.body;

		const newToken = new Token({
			userId: new mongoose.Types.ObjectId(user?._id),
			token,
		});

		user.subscriptions.posts = true;

		await Token.findOneAndDelete({
			token,
		});

		await Token.findOneAndDelete({
			token: oldToken,
		});

		await newToken.save();
		await user.save();
		res.status(200).json(newToken);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

async function sendMessage(req: LoggedInUserRequest, res: any) {
	try {
		const { recipientId, message } = req.body;
		let { img } = req.body;
		const senderId = req.user._id;

		let user;

		if (mongoose.Types.ObjectId.isValid(recipientId)) {
			user = await User.findOne({ _id: recipientId }).select("-password").select("-updatedAt").select("-email");
		} else {
			// query is username
			user = await User.findOne({ username: recipientId }).select("-password").select("-updatedAt").select("-email");
		}

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, recipientId] },
		});

		if (recipientId === "6682364096e6b50e23f0b9d6") {
			return res.status(400).json({ error: "Don't message the deleted user mask account" });
		}

		if (!conversation) {
			conversation = new Conversation({
				participants: [senderId, recipientId],
				lastMessage: {
					text: message,
					sender: senderId,
				},
			});
			await conversation.save();
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		const newMessage = new Message({
			conversationId: conversation._id,
			sender: senderId,
			text: message,
			img: img || "",
		});

		await Promise.all([
			newMessage.save(),
			conversation.updateOne({
				lastMessage: {
					text: message,
					sender: senderId,
				},
			}),
		]);

		const recipientSocketId = getRecipientSocketId(recipientId);
		if (recipientSocketId) {
			io.to(recipientSocketId).emit("newMessage", newMessage);
		}

		let isImage;

		if (img) {
			isImage = "true";
		} else {
			isImage = "false";
		}

		const tokens = await Token.find(
			{
				userId: new mongoose.Types.ObjectId(user?._id),
			}
		);

		if (tokens.length > -1) {
			tokens.map(registrationToken => {
				const fbMessage = {
					data: {
						body: message,
						image: req.user.profilePic,
						title: req.user.name,
						username: req.user.username,
						isImage,
						type: "chat",
						conversationId: conversation._id.toString(),
					},
					token: registrationToken.token as string,
				};

				// Send a message to the device corresponding to the provided
				// registration token.
				messaging.send(fbMessage)
					.then((response) => {
						// Response is a message ID string.
						console.log('Successfully sent message:', response);
					})
					.catch((error) => {
						registrationToken.deleteOne();
						console.log(error);
					});
			});
		}

		res.status(201).json(newMessage);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

async function getMessages(req: LoggedInUserRequest, res: any) {
	const { otherUserId } = req.params;
	const userId = req.user._id;
	try {
		const conversation = await Conversation.findOne({
			participants: { $all: [userId, otherUserId] },
		});

		if (!conversation) {
			return res.status(404).json({ error: "Conversation not found." });
		}

		const messages = await Message.find({
			conversationId: conversation._id,
		}).sort({ createdAt: 1 });

		res.status(200).json(messages);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

async function getConversations(req: LoggedInUserRequest, res: any) {
	const userId = req.user._id;
	try {
		const conversations = await Conversation.find({ participants: userId }).populate({
			path: "participants",
			select: "username profilePic name",
		});

		// remove the current user from the participants array
		conversations.forEach((conversation) => {
			conversation.participants = conversation.participants.filter(
				(participant) => participant._id.toString() !== userId.toString()
			);
		});
		res.status(200).json(conversations);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

export { sendMessage, getMessages, getConversations, subscribe };
