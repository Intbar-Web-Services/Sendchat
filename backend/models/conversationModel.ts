import mongoose from "mongoose";

const conversationSchema = new new mongoose.Schema(
	{
		participants: [{ type: new mongoose.Schema.Types.ObjectId, ref: "User" }],
		lastMessage: {
			text: String,
			sender: { type: new mongoose.Schema.Types.ObjectId, ref: "User" },
			seen: {
				type: Boolean,
				default: false,
			},
		},
	},
	{ timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
