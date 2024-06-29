import mongoose from "mongoose";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Token from "../models/tokenModel.js";
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

const createPost = async (req, res) => {
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
		let following = [];

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
					token: registrationToken.token
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

const getPost = async (req, res) => {
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

const getPosts = async (req, res) => {
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

const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.postedBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const likeUnlikePost = async (req, res) => {
	try {
		const { id: postId } = req.params;
		const userId = req.user._id;

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

const replyToPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;
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

const getFeedPosts = async (req, res) => {
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

const getUserPosts = async (req, res) => {
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
