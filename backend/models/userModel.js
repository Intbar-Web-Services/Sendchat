import mongoose from "mongoose";

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		isDeleted: {
			type: Boolean,
			default: false
		},
		profilePic: {
			type: String,
			default: "",
		},
		followers: {
			type: [String],
			default: [],
		},
		following: {
			type: [String],
			default: [],
		},
		bio: {
			type: String,
			default: "",
		},
		likesHidden: {
			type: Boolean,
			default: false,
		},
		firebaseId: {
			type: String,
			default: "",
		},
		subscriptions: {
			posts: {
				type: Boolean,
				default: true,
			},
			follow: {
				type: Boolean,
				default: false,
			},
		},
		punishment: {
			type: {
				type: String,
				enum: ['warn', 'suspend', 'ban', 'none'],
				default: 'none',
			},
			reason: {
				type: String,
				default: '',
			},
			hours: {
				type: Number,
				default: null,
			},
			offenses: {
				type: Number,
				default: 0,
			},
		},
		isFrozen: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("User", userSchema);

export default User;
