import mongoose from "mongoose";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Token from "../models/tokenModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";
import { messaging } from "../services/firebase.js";
async function subscribe(req, res) {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function sendMessage(req, res) {
    try {
        const { recipientId, message } = req.body;
        let { img } = req.body;
        const senderId = req.user._id;
        let user;
        if (mongoose.Types.ObjectId.isValid(recipientId)) {
            user = await User.findOne({ _id: recipientId }).select("-password").select("-updatedAt").select("-email");
        }
        else {
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
        }
        else {
            isImage = "false";
        }
        const tokens = await Token.find({
            userId: new mongoose.Types.ObjectId(user?._id),
        });
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
                    token: registrationToken.token,
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function getMessages(req, res) {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function getConversations(req, res) {
    const userId = req.user._id;
    try {
        const conversations = await Conversation.find({ participants: userId }).populate({
            path: "participants",
            select: "username profilePic name",
        });
        // remove the current user from the participants array
        conversations.forEach((conversation) => {
            conversation.participants = conversation.participants.filter((participant) => participant._id.toString() !== userId.toString());
        });
        res.status(200).json(conversations);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export { sendMessage, getMessages, getConversations, subscribe };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZUNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9iYWNrZW5kL2NvbnRyb2xsZXJzL21lc3NhZ2VDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQztBQUNoQyxPQUFPLFlBQVksTUFBTSxnQ0FBZ0MsQ0FBQztBQUMxRCxPQUFPLE9BQU8sTUFBTSwyQkFBMkIsQ0FBQztBQUNoRCxPQUFPLElBQUksTUFBTSx3QkFBd0IsQ0FBQztBQUMxQyxPQUFPLEtBQUssTUFBTSx5QkFBeUIsQ0FBQztBQUM1QyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsRUFBRSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDL0QsT0FBTyxFQUFFLEVBQUUsSUFBSSxVQUFVLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDOUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBSXBELEtBQUssVUFBVSxTQUFTLENBQUMsR0FBd0IsRUFBRSxHQUFRO0lBQzFELElBQUksQ0FBQztRQUNKLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDdEIsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBRXJDLE1BQU0sUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDO1lBQzFCLE1BQU0sRUFBRSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUM7WUFDOUMsS0FBSztTQUNMLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUVoQyxNQUFNLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztZQUM1QixLQUFLO1NBQ0wsQ0FBQyxDQUFDO1FBRUgsTUFBTSxLQUFLLENBQUMsZ0JBQWdCLENBQUM7WUFDNUIsS0FBSyxFQUFFLFFB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