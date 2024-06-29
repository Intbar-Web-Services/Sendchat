import mongoose from "mongoose";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";
import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from "firebase-admin/messaging";

const key = {
	"type": "service_account",
	"project_id": "iws-sendchat",
	"private_key_id": "aaa6ae2ce7370ac22a7bb13ec4f8953eb67f68ed",
	"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD4l9nKm7HRQhsn\n91vsOQ6tdyIGpFk6hcJMNwCmdduiqDuazsBKl5OLtNnD2Oxt7LRt7ehEvfPUGxVT\nzF3Q0jl+bfN7AgGVS9w+a/HIkqYXMTSGM+MM49YBwpxqqZnroWjYde+y3ovD1ZuF\ni0rzfjnsKxBjyNOWq9V4So6XQT8vDkroxbBaggT3lyYaNBOVsDeukZNAHD5XyE5l\nBtwIfHmrixT5zh4R5f/VuFW5fWv4blQJyde0GGleRUY/w6k08y6vuTVarv3Zaucw\nPk5Hco2/YdY5UEQPMUqETHgNUlhGOZc6FfwbDxp0shl3O2FEdplFh+94RZKUSMj5\nyXjaMM7zAgMBAAECggEAGkhrxWkarsYvetVDScFqlNqApXUg3fggZ9B06CST2Smy\nS5bKa9iEyAOR9ovry194YBsEMKhorCdE5Pw5eweO/pf/YyT+J9vCaHMfOBaRKuiP\n5hR8T/OSv9LkmL5fwLLrE9+8PQwceNMPw1nLzdytoROYgwRLoqV+R16SntlOJdpG\npvKxc5jRISpwBXa353m3VIjf8fq0gde6U6fEuMe7Lgpr4nsGtPzQPYxnMgzlhq/E\nN7ai7YUQvBtG2rvFUlBZpauSiumkjm++Quyv1axXHwdUsMO1OsFJPclAogG/d1jo\nDkxf2bPrgkk7R/H1UPhr4vSPIlU3gAR0WZsL0WZNcQKBgQD9y7MTAaDKvb5V+tOJ\n3+GkFayBn3LgldpDGjrBuXG/zj0b5RwdDFUDhaHoAAdqyp1dead9lp83U0mIghvR\n2wnQWJis0CnFhzQc/TowrpwHn1LfLtqgedZAORa17dSke15jSG8k+pv7525/WKsN\n8sZHUtu0+xX/aOYPTVtMWMH0KwKBgQD6wJVtHyjzN1BKO7l0KdT5tQpK+TKQ+0xv\ncGerTVzSZ7g7n9/1Rbj9aGlO7nmtjFnHQRMkuN6Hh60fBQyqT4q2wHPWz+YAay22\nVaL0whmzHK3931QhCRbDigmErAUqm5adrSM7iyigx4mq/0xoo8GBX3Z37znHN80d\n3o063HbEWQKBgHD6Ws8dLGzUJoSz0bNQnGuk0lQpnMPpMW4poPpYCRDvSDjAttEf\nikC1Hivex258n6za2PqJMHs6ckN4V9YFgcrjhaN4TwAFfedhuqOtNvwVqph7jQte\n8UdJoph+NOi7mnrr5b46aXGrxn6eBBeDeUyK0A8yrsox8ifhscC8yipdAoGBALBl\nP/jmvbDzDXlbMGgmcVtEXzxEt6zEC44tfdBE+PJO4oyXOD5b0Pn7NHHBUzmiDRod\njjD8GBcxe7jhnXpFwGg1VIgd8kgDHcIx1hPmY5vbpg58x7sBoNDnzzBUrsG9eCPt\nw2ZEy8zm8dKoDAFkiWDQXg+a64NYnuPPRnzM0IPpAoGACCE90mfDZmZheKnVKQYu\nkkb6D05K1VeMyWr6503yKmDQ98XLMr1NuYnpaInmA5M9QYIg23J0UkLAuqygU31U\nN3ZfkxYNjarDlB4UUdI5PdA49DFKVUC3+k54kZ7LGqCPwRu2XCI2oJ214U8v/lhw\n/qAXtJT2NlTBjmdBxQ4FX1Y=\n-----END PRIVATE KEY-----\n",
	"client_email": "firebase-adminsdk-71mod@iws-sendchat.iam.gserviceaccount.com",
	"client_id": "115956577241170798722",
	"auth_uri": "https://accounts.google.com/o/oauth2/auth",
	"token_uri": "https://oauth2.googleapis.com/token",
	"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
	"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-71mod%40iws-sendchat.iam.gserviceaccount.com",
	"universe_domain": "googleapis.com"
};

const app = initializeApp({
	project_id: "iws-sendchat",
	credential: cert(key),
});

const messaging = getMessaging(app);

async function subscribe(req, res) {
	try {
		const user = req.user;
		const { token, oldToken } = req.body;

		user.regTokens.push(token);
		console.log(user);

		if (oldToken && user.regTokens.includes(oldToken)) {
			user.regTokens.splice(user.regTokens.indexOf(oldToken));
		}
		console.log(user);

		await user.save();
		res.status(200).json(user);
	} catch (error) {
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
			user = await User.findOne({ _id: recipientId }).select("-password").select("-regTokens").select("-updatedAt").select("-email");
		} else {
			// query is username
			user = await User.findOne({ username: recipientId }).select("-password").select("-regTokens").select("-updatedAt").select("-email");
		}

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, recipientId] },
		});

		if (recipientId === "6672b78eab0404a06146d47c") {
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

		if (user.regTokens.length > -1) {
			user.regTokens.map(registrationToken => {
				const fbMessage = {
					data: {
						body: message,
						image: req.user.profilePic,
						title: req.user.name,
						username: req.user.username,
						isImage,
						conversationId: conversation._id.toString(),
					},
					token: registrationToken
				};

				// Send a message to the device corresponding to the provided
				// registration token.
				messaging.send(fbMessage)
					.then((response) => {
						// Response is a message ID string.
						console.log('Successfully sent message:', response);
					})
					.catch((error) => {
						console.log('Error sending message:', error);
					});
			});
		}

		res.status(201).json(newMessage);
	} catch (error) {
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
	} catch (error) {
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
