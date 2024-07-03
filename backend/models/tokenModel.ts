import mongoose from "mongoose";

const tokenSchema = new new mongoose.Schema(
	{
		userId: { type: new mongoose.Schema.Types.ObjectId, ref: "User" },
		token: String,
	},
	{ timestamps: true }
);

const Token = mongoose.model("Token", tokenSchema);

export default Token;
