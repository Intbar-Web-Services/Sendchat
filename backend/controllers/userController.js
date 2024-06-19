import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import cron from "cron";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const getUserProfile = async (req, res) => {
	// We will fetch user profile either with username or userId
	// query is either username or userId
	const { query } = req.params;

	try {
		let user;

		// query is userId
		if (mongoose.Types.ObjectId.isValid(query)) {
			user = await User.findOne({ _id: query }).select("-password").select("-updatedAt").select("-email");
		} else {
			// query is username
			user = await User.findOne({ username: query }).select("-password").select("-updatedAt").select("-email");
		}

		if (!user) return res.status(404).json({ error: "User not found" });

		if (user.isDeleted) return res.status(200).json(await User.findOne({ _id: "6672b78eab0404a06146d47c" }).select("-password").select("-updatedAt").select("-email"));

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in getUserProfile: ", err.message);
	}
};

const signupUser = async (req, res) => {
	try {
		const { name, email, username, password } = req.body;
		const user = await User.findOne({ $or: [{ email }, { username }] });

		if (user) {
			return res.status(400).json({ error: "User already exists" });
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		if (username) {
			if (new RegExp(/[^a-z0-9_]/g, "").test(username))
				return res.status(400).json({ error: "Your username contains characters that aren't allowed" });
			if (username.length > 25 || username.length < 3)
				return res.status(400).json({ error: "Your username is too long or too short" });
		}

		if (name) {
			if (name.length > 30 || name.length < 3)
				return res.status(400).json({ error: "Your display name is too long or too short" });
			if (new RegExp(/[^a-zA-Z0-9_. ]/g, "").test(name))
				return res.status(400).json({ error: "Your display name contains characters that aren't allowed" });
		}

		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

		if (email) {
			if (email.length > 200)
				return res.status(400).json({ error: "Your email is too long" });
			if (!emailRegex.test(email))
				return res.status(400).json({ error: "Your email is invalid" });
		}

		const newUser = new User({
			name,
			email,
			username,
			password: hashedPassword,
		});
		await newUser.save();

		if (newUser) {
			generateTokenAndSetCookie(newUser._id, res);

			res.status(201).json({
				_id: newUser._id,
				name: newUser.name,
				email: newUser.email,
				isAdmin: newUser.isAdmin,
				username: newUser.username,
				bio: newUser.bio,
				likesHidden: newUser.likesHidden,
				punishment: newUser.punishment,
				profilePic: newUser.profilePic,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in signupUser: ", err.message);
	}
};

const loginUser = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) return res.status(400).json({ error: "Invalid username or password" });

		if (user.isFrozen) {
			user.isFrozen = false;
			await user.save();
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
			username: user.username,
			bio: user.bio,
			likesHidden: user.likesHidden,
			punishment: user.punishment,
			profilePic: user.profilePic,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
		console.log("Error in loginUser: ", error.message);
	}
};

const logoutUser = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 1 });
		res.status(200).json({ message: "User logged out successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in signupUser: ", err.message);
	}
};

const followUnFollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		const userToModify = await User.findById(id);
		const currentUser = await User.findById(req.user._id);

		if (id === req.user._id.toString())
			return res.status(400).json({ error: "You cannot follow/unfollow yourself" });

		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		if (id === "6672b78eab0404a06146d47c") {
			return res.status(400).json({ error: "Don't follow the deleted user mask account" });
		}

		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// Unfollow user
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// Follow user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in followUnFollowUser: ", err.message);
	}
};

const updateUser = async (req, res) => {
	const { name, email, username, password, bio } = req.body;
	let { profilePic } = req.body;

	const userId = req.user._id;
	try {
		let user = await User.findById(userId);
		if (!user) return res.status(400).json({ error: "User not found" });

		if (req.params.id !== userId.toString())
			return res.status(400).json({ error: "You cannot update other user's profile" });

		if (password) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			user.password = hashedPassword;
		}
		const badWords = /(\b\W*f\W*a\W*g\W*(g\W*o\W*t\W*t\W*a\W*r\W*d)?|m\W*a\W*r\W*i\W*c\W*o\W*s?|c\W*o\W*c\W*k\W*s?\W*u\W*c\W*k\W*e\W*r\W*(s\W*i\W*n\W*g)?|\bn\W*i\W*g\W*(\b|g\W*(a\W*|e\W*r)?s?)\b|d\W*i\W*n\W*d\W*u\W*(s?)|m\W*u\W*d\W*s\W*l\W*i\W*m\W*e\W*s?|k\W*i\W*k\W*e\W*s?|m\W*o\W*n\W*g\W*o\W*l\W*o\W*i\W*d\W*s?|t\W*o\W*w\W*e\W*l\W*\s\W*h\W*e\W*a\W*d\W*s?|\bs\W*p\W*i\W*(c\W*|\W*)s?\b|\bch\W*i\W*n\W*k\W*s?|n\W*i\W*g\W*l\W*e\W*t\W*s?|b\W*e\W*a\W*n\W*e\W*r\W*s?|\bn\W*i\W*p\W*s?\b|\bco\W*o\W*n\W*s?\b|j\W*u\W*n\W*g\W*l\W*e\W*\s\W*b\W*u\W*n\W*n\W*(y\W*|i\W*e\W*s?)|j\W*i\W*g\W*g?\W*a\W*b\W*o\W*o\W*s?|\bp\W*a\W*k\W*i\W*s?\b|r\W*a\W*g\W*\s\W*h\W*e\W*a\W*d\W*s?|g\W*o\W*o\W*k\W*s?|c\W*u\W*n\W*t\W*s?\W*(e\W*s\W*|i\W*n\W*g\W*|y)?|t\W*w\W*a\W*t\W*s?|f\W*e\W*m\W*i\W*n\W*a\W*z\W*i\W*s?|w\W*h\W*o\W*r\W*(e\W*s?\W*|i\W*n\W*g)|\bs\W*l\W*u\W*t\W*(s\W*|t\W*?\W*y)?|\btr\W*a\W*n\W*n?\W*(y\W*|i\W*e\W*s?)|l\W*a\W*d\W*y\W*b\W*o\W*y\W*(s?))/gmi;

		if (username) {
			if (new RegExp(/[^a-z0-9_]/g, "").test(username))
				return res.status(400).json({ error: "Your username contains characters that aren't allowed" });
			if (username.length > 25 || username.length < 3)
				return res.status(400).json({ error: "Your username is too long or too short" });
			if (badWords.test(username)) {
				user.punishment.offenses++;
				if (!user.isAdmin) {
					if (user.punishment.offenses >= 2 && user.punishment.offenses <= 3) {
						user.punishment.type = "warn";
						user.punishment.reason = "You have said too many blacklisted words. If you do this more you will get banned"
					} else if (user.punishment.offenses >= 3 && user.punishment.offenses <= 20) {
						user.punishment.type = "suspend";
						user.punishment.hours = Math.floor(new Date().getTime() / 1000.0) + 259200;
						user.punishment.reason = "You have said too many blacklisted words. You are now supended"
					} else if (user.punishment.offenses > 20) {
						user.punishment.type = "ban";
						user.punishment.reason = reason;
						user.punishment.hours = hoursParsedDate;
						user.punishment.offenses++;

						const job = new cron.CronJob("0/45 * * * *", async () => {
							const cronUser = user;
							if (cronUser.punishment.hours + 864000 <= Math.floor(new Date().getTime() / 1000.0)) {
								if (cronUser.punishment.type === "ban") {
									cronUser.username = `deletedUser_${cronUser._id}`
									cronUser.name = `Deleted User ${cronUser._id}`
									cronUser.bio = "";
									cronUser.punishment.type = "none";
									cronUser.profilePic = "";
									cronUser.isDeleted = true;
									cronUser.password = `${Date.now()}`;

									await cronUser.save();
									job.stop();
								} else {
									job.stop();
								}
							}
						});

						job.start();
					}
					await user.save();
				}
			}
		}

		if (name) {
			if (name.length > 30 || name.length < 3)
				return res.status(400).json({ error: "Your display name is too long or too short" });
			if (new RegExp(/[^a-zA-Z0-9_. ]/g, "").test(name))
				return res.status(400).json({ error: "Your display name contains characters that aren't allowed" });
		}

		if (bio) {
			if (bio.length > 500)
				return res.status(400).json({ error: "Your bio is too long" });
		}


		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

		if (email) {
			if (email.length > 200)
				return res.status(400).json({ error: "Your email is too long" });
			if (!emailRegex.test(email))
				return res.status(400).json({ error: "Your email is invalid" });
		}

		if (profilePic) {
			if (user.profilePic) {
				await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profilePic);
			profilePic = uploadedResponse.secure_url;
		}

		user.name = name || user.name;
		user.email = email || user.email;
		user.username = username || user.username;
		user.profilePic = profilePic || user.profilePic;
		user.bio = bio || user.bio;

		user = await user.save();

		// Find all posts that this user replied and update username and userProfilePic fields
		await Post.updateMany(
			{ "replies.userId": userId },
			{
				$set: {
					"replies.$[reply].username": user.username,
					"replies.$[reply].userProfilePic": user.profilePic,
					"replies.$[reply].name": user.name
				},
			},
			{ arrayFilters: [{ "reply.userId": userId }] }
		);

		// password should be null in response
		user.password = null;

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in updateUser: ", err.message);
	}
};

const getSuggestedUsers = async (req, res) => {
	try {
		// exclude the current user from suggested users array and exclude users that current user is already following
		const userId = req.user._id;

		const usersFollowedByYou = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $nin: [userId, new mongoose.Types.ObjectId("6672b78eab0404a06146d47c")] },
				},
			},
			{
				$sample: { size: 10 },
			},
		]);
		const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const freezeAccount = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}

		user.isFrozen = true;
		await user.save();

		res.status(200).json({ success: true });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export {
	signupUser,
	loginUser,
	logoutUser,
	followUnFollowUser,
	updateUser,
	getUserProfile,
	getSuggestedUsers,
	freezeAccount,
};
