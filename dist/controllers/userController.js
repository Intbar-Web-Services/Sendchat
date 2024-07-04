import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import cron from "cron";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { auth } from "../services/firebase.js";
const getUserProfile = async (req, res) => {
    // We will fetch user profile either with username or userId
    // query is either username or userId
    const { query } = req.params;
    try {
        let user;
        // query is userId
        if (mongoose.Types.ObjectId.isValid(query)) {
            user = await User.findOne({ _id: query }).select("-password").select("-updatedAt").select("-email");
        }
        else {
            // query is username
            user = await User.findOne({ username: query }).select("-password").select("-updatedAt").select("-email");
        }
        if (!user)
            return res.status(404).json({ error: "User not found" });
        if (user.isDeleted)
            return res.status(200).json(await User.findOne({ _id: "6682364096e6b50e23f0b9d6" }).select("-password").select("-updatedAt").select("-email"));
        const firebaseUser = await auth.getUser(user.firebaseId);
        user._doc.isAdmin = firebaseUser.customClaims['admin'];
        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in getUserProfile: ", err.message);
    }
};
const signupUser = async (req, res) => {
    try {
        const { name, email, username, password, token } = req.body;
        const user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }
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
        const tokenParsed = token?.split(" ")[1];
        let firebaseUser;
        if (tokenParsed) {
            firebaseUser = await auth.verifyIdToken(tokenParsed);
        }
        if (!firebaseUser)
            return res.status(401).json({ message: "Unauthorized" });
        const newUser = new User({
            name,
            email,
            username,
            firebaseId: firebaseUser.user_id,
        });
        await newUser.save();
        await auth.setCustomUserClaims(firebaseUser.user_id, { admin: false });
        await auth.updateUser(firebaseUser.user_id, {
            displayName: name,
        });
        if (newUser) {
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                isAdmin: false,
                username: newUser.username,
                bio: newUser.bio,
                likesHidden: newUser.likesHidden,
                punishment: newUser.punishment,
                profilePic: newUser.profilePic,
            });
        }
        else {
            res.status(400).json({ error: "Invalid user data" });
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in signupUser: ", err.message);
    }
};
const loginUser = async (req, res) => {
    try {
        const { email, password, token, } = req.body;
        const firebaseToken = token?.split(" ")[1];
        if (!firebaseToken)
            return res.status(401).json({ error: "Unauthorized" });
        const firebaseUser = await auth.verifyIdToken(firebaseToken);
        const user = await User.findOne({ firebaseId: firebaseUser.user_id });
        if (!user)
            return res.status(400).json({ error: "Invalid username or password" });
        const firebaseUserAccount = await auth.getUser(user.firebaseId);
        if (user.isFrozen) {
            user.isFrozen = false;
            await user.save();
        }
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: firebaseUserAccount.customClaims ? ['admin'] : Promise,
            username: user.username,
            bio: user.bio,
            likesHidden: user.likesHidden,
            punishment: user.punishment,
            profilePic: user.profilePic,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in loginUser: ", error.message);
    }
};
const logoutUser = async (req, res) => {
    try {
        // remove regtokens eventually...
        res.status(200).json({ message: "User logged out successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in logout: ", err.message);
    }
};
const followUnFollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);
        if (id === req.user._id.toString())
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
        if (!userToModify || !currentUser)
            return res.status(400).json({ error: "User not found" });
        if (id === "6682364096e6b50e23f0b9d6") {
            return res.status(400).json({ error: "Don't follow the deleted user mask account" });
        }
        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            // Unfollow user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            res.status(200).json({ message: "User unfollowed successfully" });
        }
        else {
            // Follow user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            res.status(200).json({ message: "User followed successfully" });
        }
    }
    catch (err) {
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
        if (!user)
            return res.status(400).json({ error: "User not found" });
        if (req.params.id !== userId.toString())
            return res.status(400).json({ error: "You cannot update other user's profile" });
        if (email && password) {
            await auth.updateUser(req.user.firebaseId, {
                email,
                password,
            });
        }
        else if (password) {
            await auth.updateUser(req.user.firebaseId, {
                password,
            });
        }
        else if (email) {
            await auth.updateUser(req.user.firebaseId, {
                email,
            });
        }
        const firebaseUser = await auth.getUser(user.firebaseId);
        const badWords = /(\b\W*f\W*a\W*g\W*(g\W*o\W*t\W*t\W*a\W*r\W*d)?|m\W*a\W*r\W*i\W*c\W*o\W*s?|c\W*o\W*c\W*k\W*s?\W*u\W*c\W*k\W*e\W*r\W*(s\W*i\W*n\W*g)?|\bn\W*i\W*g\W*(\b|g\W*(a\W*|e\W*r)?s?)\b|d\W*i\W*n\W*d\W*u\W*(s?)|m\W*u\W*d\W*s\W*l\W*i\W*m\W*e\W*s?|k\W*i\W*k\W*e\W*s?|m\W*o\W*n\W*g\W*o\W*l\W*o\W*i\W*d\W*s?|t\W*o\W*w\W*e\W*l\W*\s\W*h\W*e\W*a\W*d\W*s?|\bs\W*p\W*i\W*(c\W*|\W*)s?\b|\bch\W*i\W*n\W*k\W*s?|n\W*i\W*g\W*l\W*e\W*t\W*s?|b\W*e\W*a\W*n\W*e\W*r\W*s?|\bn\W*i\W*p\W*s?\b|\bco\W*o\W*n\W*s?\b|j\W*u\W*n\W*g\W*l\W*e\W*\s\W*b\W*u\W*n\W*n\W*(y\W*|i\W*e\W*s?)|j\W*i\W*g\W*g?\W*a\W*b\W*o\W*o\W*s?|\bp\W*a\W*k\W*i\W*s?\b|r\W*a\W*g\W*\s\W*h\W*e\W*a\W*d\W*s?|g\W*o\W*o\W*k\W*s?|c\W*u\W*n\W*t\W*s?\W*(e\W*s\W*|i\W*n\W*g\W*|y)?|t\W*w\W*a\W*t\W*s?|f\W*e\W*m\W*i\W*n\W*a\W*z\W*i\W*s?|w\W*h\W*o\W*r\W*(e\W*s?\W*|i\W*n\W*g)|\bs\W*l\W*u\W*t\W*(s\W*|t\W*?\W*y)?|\btr\W*a\W*n\W*n?\W*(y\W*|i\W*e\W*s?)|l\W*a\W*d\W*y\W*b\W*o\W*y\W*(s?))/gmi;
        if (username) {
            if (new RegExp(/[^a-z0-9_]/g, "").test(username))
                return res.status(400).json({ error: "Your username contains characters that aren't allowed" });
            if (username.length > 25 || username.length < 3)
                return res.status(400).json({ error: "Your username is too long or too short" });
            if (badWords.test(username)) {
                user.punishment.offenses++;
                if (!firebaseUser.customClaims['admin']) {
                    if (user.punishment.offenses >= 2 && user.punishment.offenses <= 3) {
                        user.punishment.type = "warn";
                        user.punishment.reason = "You have said too many blacklisted words. If you do this more you will get banned";
                    }
                    else if (user.punishment.offenses >= 3 && user.punishment.offenses <= 20) {
                        user.punishment.type = "suspend";
                        user.punishment.hours = Math.floor(new Date().getTime() / 1000.0) + 259200;
                        user.punishment.reason = "You have said too many blacklisted words. You are now supended";
                    }
                    else if (user.punishment.offenses > 20) {
                        user.punishment.type = "ban";
                        user.punishment.reason = "ban";
                        user.punishment.hours = 1;
                        user.punishment.offenses++;
                        const job = new cron.CronJob("0/45 * * * *", async () => {
                            const cronUser = user;
                            const uid = cronUser?.firebaseId;
                            if (cronUser?.punishment.hours + 864000 <= Math.floor(new Date().getTime() / 1000.0)) {
                                if (cronUser?.punishment.type === "ban") {
                                    cronUser.username = `deletedUser_${cronUser?._id}`;
                                    cronUser.name = `Deleted User ${cronUser._id}`;
                                    cronUser.bio = "";
                                    cronUser.punishment.type = "none";
                                    cronUser.profilePic = "";
                                    cronUser.isDeleted = true;
                                    auth.updateUser(uid, {
                                        disabled: true,
                                        photoURL: null,
                                        displayName: `Deleted User ${cronUser._id}`,
                                    });
                                    await cronUser.save();
                                    job.stop();
                                }
                                else {
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
        await auth.updateUser(user.firebaseId, {
            displayName: name || user.name,
            photoURL: profilePic || user.profilePic,
        });
        // Find all posts that this user replied and update username and userProfilePic fields
        await Post.updateMany({ "replies.userId": userId }, {
            $set: {
                "replies.$[reply].username": user.username,
                "replies.$[reply].userProfilePic": user.profilePic,
                "replies.$[reply].name": user.name
            },
        }, { arrayFilters: [{ "reply.userId": userId }] });
        res.status(200).json(user);
    }
    catch (err) {
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
                    _id: { $nin: [userId, new mongoose.Types.ObjectId("6682364096e6b50e23f0b9d6")] },
                    isDeleted: { $ne: true },
                },
            },
            {
                $sample: { size: 10 },
            },
        ]);
        const filteredUsers = users.filter(user => !usersFollowedByYou.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);
        suggestedUsers.forEach((user) => (user.password = null));
        res.status(200).json(suggestedUsers);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const freezeAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user)
            return res.status(400).json({ error: "User not found" });
        user.isFrozen = true;
        await user.save();
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export { signupUser, loginUser, logoutUser, followUnFollowUser, updateUser, getUserProfile, getSuggestedUsers, freezeAccount, };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9iYWNrZW5kL2NvbnRyb2xsZXJzL3VzZXJDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sSUFBSSxNQUFNLHdCQUF3QixDQUFDO0FBQzFDLE9BQU8sSUFBSSxNQUFNLHdCQUF3QixDQUFDO0FBRTFDLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUN4QixPQUFPLEVBQUUsRUFBRSxJQUFJLFVBQVUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUM5QyxPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUM7QUFDaEMsT0FBTyxFQUFPLElBQUksRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBTXBELE1BQU0sY0FBYyxHQUFHLEtBQUssRUFBRSxHQUFZLEVBQUUsR0FBUSxFQUFFLEVBQUU7SUFDdkQsNERBQTREO0lBQzVELHFDQUFxQztJQUNyQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUU3QixJQUFJLENBQUM7UUFDSixJQUFJLElBQWMsQ0FBQztRQUVuQixrQkFBa0I7UUFDbEIsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUM1QyxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckcsQ0FBQzthQUFNLENBQUM7WUFDUCxvQkFBb0I7WUFDcEIsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFN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