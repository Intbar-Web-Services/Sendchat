import mongoose from "mongoose";

const messageSchema = new new mongoose.Schema(
	{
		conversationId: { type: new mongoose.Schema.Types.ObjectId, ref: "Conversation" },
		sender: { type: new mongoose.Schema.Types.ObjectId, ref: "User" },
		text: String,
		seen: {
			type: Boolean,
			default: false,
		},
		img: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
