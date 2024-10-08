import mongoose from "mongoose";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Token from "../models/tokenModel.js";
import { v2 as cloudinary } from "cloudinary";
import { app, messaging, auth } from "../services/firebase.js";
import LoggedInUserRequest from "../contracts/loggedInUser.js";
import { Request, Response } from "express";

const createPost = async (req: LoggedInUserRequest, res: any) => {
	try {
		const { postedBy, text } = req.body;
		let { img } = req.body;

		if (!postedBy || !text) {
			return res.status(400).json({ error: "You cannot post something without text!" });
		}

		const user = await User.findById(postedBy);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (user._id.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "You aren't authorized to create a post" });
		}

		const maxLength = 500;
		if (text.length > maxLength) {
			return res.status(400).json({ error: `Text must be less than ${maxLength} characters` });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		const newPost = new Post({ postedBy, text, img });
		await newPost.save();

		const users = await User.find({ 'subscriptions.posts': { $exists: true, $eq: true } });
		let following: mongoose.Types.ObjectId[] = [];

		users.map((followingUser) => {
			if (user.followers.includes(followingUser._id.toString())) {
				following.push(followingUser._id);
			}
		});

		const tokens = await Token.find(
			{ userId: { $in: following } }
		);

		if (tokens.length > -1) {
			tokens.map(registrationToken => {
				const fbMessage = {
					data: {
						body: text,
						image: img ?? "",
						title: `New post by ${user.name}`,
						username: user.username,
						isImage: img ? "true" : "false",
						type: "post",
						conversationId: newPost._id.toString(),
					},
					token: registrationToken.token as string,
				};

				// Send a message to the device corresponding to the provided
				// registration token.
				messaging.send(fbMessage)
					.then((response) => {
						// Response is a message ID string.
						console.log('Successfully sent message for post:', response);
					})
					.catch((error) => {
						registrationToken.deleteOne();
						console.log(error);
					});
			});
		}

		res.status(201).json(newPost);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log(err);
	}
};

const getPost = async (req: Request, res: any) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		res.status(200).json(post);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getPosts = async (req: Request, res: any) => {
	try {
		const posts = await Post.find();

		if (!posts) {
			return res.status(404).json({ error: "No posts on Sendchat?" });
		}
		res.status(200).json(posts);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const deletePost = async (req: LoggedInUserRequest, res: any) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const firebaseCurrentUser = await auth.getUser(req.user.firebaseId);

		if (post.postedBy.toString() !== req.user._id.toString() && !firebaseCurrentUser.customClaims!['admin']) {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop()?.split(".")[0];
			await cloudinary.uploader.destroy(imgId as string);
		}

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const likeUnlikePost = async (req: LoggedInUserRequest, res: any) => {
	try {
		const { id: postId } = req.params;
		const userId = new mongoose.Types.ObjectId(req.user._id);

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			res.status(200).json({ message: "You unliked this post" });
		} else {
			// Like post
			post.likes.push(userId);
			await post.save();
			res.status(200).json({ message: "You liked this post" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const replyToPost = async (req: LoggedInUserRequest, res: any) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = new mongoose.Types.ObjectId(req.user._id);
		const userProfilePic = req.user.profilePic;
		const username = req.user.username;
		const name = req.user.name;

		if (!text) {
			return res.status(400).json({ error: "Write a reply!" });
		}

		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const reply = { userId, text, userProfilePic, username, name };

		post.replies.push(reply);
		await post.save();

		res.status(200).json(reply);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getFeedPosts = async (req: LoggedInUserRequest, res: any) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const following = user.following;

		const feedPosts = await Post.find({
			$or: [
				{ postedBy: userId }, // Posts by the user
				{ postedBy: { $in: following } }, // Posts by the user's followings
			],
		}).sort({ createdAt: -1 });

		res.status(200).json(feedPosts);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getUserPosts = async (req: Request, res: any) => {
	const { username } = req.params;
	try {
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });

		res.status(200).json(posts);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export { createPost, getPost, getPosts, deletePost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts };
