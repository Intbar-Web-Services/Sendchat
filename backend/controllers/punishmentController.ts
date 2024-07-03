import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import cron from "cron";
import { auth } from "../services/firebase.js";
import LoggedInUserRequest from "../contracts/loggedInUser.js";
import { Response } from "express";
import { default as UserType } from "../contracts/user.js";

const activateCode = async (req: LoggedInUserRequest, res) => {
    const { code } = req.params;
    const keys = ["FbhYbF3B929gDAQzFY", "FabFhCbNiy4368fYavE"];
    const fakeKey = "F7FosFvHjwiIspUSafV";
    const user = req.user;

    if (!user) return res.status(404).json({ error: "User not found" });

    try {
        if (keys.includes(code) || keys.includes((code.split("/activate?code=").pop()) as string)) {
            await auth.setCustomUserClaims(user.firebaseId, { admin: true });
            user.punishment.offenses = 0;
            user.punishment.type = "none";

            await user.save();
            user._doc.isAdmin = true;
            return res.status(200).json(user);
        } else if (code == fakeKey || decodeURI(code).split("/activate?code=").pop() == fakeKey) {
            return res.status(400).json({ error: "Lmao get trolled" });
        } else {
            return res.status(400).json({ error: "Couldn't activate admin with code" });
        }
    } catch (err) {
        return res.status(500).json({ error: "Couldn't activate admin with code" });
    }
};

const warnUser = async (req: LoggedInUserRequest, res) => {
    // We will fetch user profile either with username or userId
    // query is either username or userId
    const { id } = req.params;

    try {
        let user: UserType;
        const { reason } = req.body;

        // query is userId
        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findOne({ _id: id }).select("-password").select("-updatedAt").select("-email");
        } else {
            // query is username
            user = await User.findOne({ username: id }).select("-password").select("-updatedAt").select("-email");
        }

        if (!user) return res.status(404).json({ error: "User not found" });
        const firebaseUser = await auth.getUser(user.firebaseId);
        const firebaseCurrentUser = await auth.getUser(req.user.firebaseId);

        if (!await firebaseCurrentUser.customClaims!['admin']) return res.status(401).json({ error: "You are not an admin." });

        if (firebaseUser.customClaims!['admin']) return res.status(400).json({ error: "You cannot warn an admin." });

        user.punishment.type = "warn";
        user.punishment.reason = reason;
        user.punishment.offenses++;
        user = await user.save();

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error warning user: ", err.message);
    }
};

const banUser = async (req: LoggedInUserRequest, res) => {
    const { id } = req.params;

    try {
        let user: UserType;
        const { reason, hoursParsedDate } = req.body;

        // query is userId
        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findOne({ _id: id }).select("-password").select("-updatedAt").select("-email");
        } else {
            // query is username
            user = await User.findOne({ username: id }).select("-password").select("-updatedAt").select("-email");
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        const firebaseCurrentUser = await auth.getUser(req.user.firebaseId);
        const firebaseUser = await auth.getUser(user.firebaseId);

        if (!firebaseCurrentUser.customClaims!['admin']) return res.status(401).json({ error: "You are not an admin." });

        if (firebaseUser.customClaims!['admin']) return res.status(400).json({ error: "You cannot ban an admin." });

        user.punishment.type = "ban";
        user.punishment.reason = reason;
        user.punishment.hours = hoursParsedDate;
        user.punishment.offenses++;
        user = await user.save();

        const job = new cron.CronJob("*/10 * * * *", async () => {
            const cronUser = user;
            const uid = cronUser.firebaseId;
            if (cronUser.punishment.hours as number + 864000 <= Math.floor(new Date().getTime() / 1000.0)) {
                if (cronUser.punishment.type === "ban") {
                    cronUser.username = `deletedUser_${cronUser._id}`
                    cronUser.name = `Deleted User ${cronUser._id}`
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
                } else {
                    job.stop();
                }
            }
        });

        job.start();

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error warning user: ", err.message);
    }
};

const unsuspendSelf = async (req: LoggedInUserRequest, res) => {
    try {
        let user = req.user;

        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.punishment.hours as number > Math.floor(new Date().getTime() / 1000.0)) return res.status(400).json({ error: "You are still suspended." });

        user.punishment.type = "warn";
        user.punishment.reason = "You've been suspended recently, watch your behavior.";
        user.punishment.hours = 0;
        user = await user.save();

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const suspendUser = async (req: LoggedInUserRequest, res) => {
    const { id } = req.params;

    try {
        let user: UserType;
        const { hoursParsed, reason } = req.body;

        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findOne({ _id: id }).select("-password").select("-updatedAt").select("-email");
        } else {
            // query is username
            user = await User.findOne({ username: id }).select("-password").select("-updatedAt").select("-email");
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        const firebaseCurrentUser = await auth.getUser(req.user.firebaseId);
        const firebaseUser = await auth.getUser(user.firebaseId);

        if (!firebaseCurrentUser.customClaims!['admin']) return res.status(401).json({ error: "You are not an admin." });

        if (firebaseUser.customClaims!['admin']) return res.status(400).json({ error: "You cannot warn an admin." });

        user.punishment.type = "suspend";
        user.punishment.reason = reason;
        user.punishment.hours = hoursParsed;
        user = await user.save();

        const job = new cron.CronJob("*/14 * * * *", async function () {
            const cronUser = user;
            if (cronUser.punishment.hours as number <= Math.floor(new Date().getTime() / 1000.0)) {
                cronUser.punishment.type = "warn";
                cronUser.punishment.reason = "You've been suspended recently, watch your behavior.";
                cronUser.hours = 0;

                await cronUser.save();
                job.stop();
            }
        });

        job.start();

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const demoteSelf = async (req: LoggedInUserRequest, res) => {
    try {
        let user = req.user;

        const firebaseUser = await auth.getUser(user.firebaseId);

        if (!firebaseUser.customClaims!['admin']) return res.status(401).json({ error: "You are not an admin" });

        await auth.setCustomUserClaims(user.firebaseId, { admin: false });
        user._doc.isAdmin = false;

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error demoting self: ", err.message);
    }
};

const unWarnUser = async (req: LoggedInUserRequest, res) => {
    const { id } = req.params;

    try {
        let user: UserType;

        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findOne({ _id: id }).select("-password").select("-updatedAt").select("-email");
        } else {
            // query is username
            user = await User.findOne({ username: id }).select("-password").select("-updatedAt").select("-email");
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.punishment.type != "warn") return res.status(400).json({ error: "User not warned." });

        const firebaseCurrentUser = await auth.getUser(req.user.firebaseId);

        if (!firebaseCurrentUser.customClaims!['admin']) return res.status(401).json({ error: "You are not an admin" });

        user.punishment.type = "none";
        user.punishment.reason = "";
        user = await user.save();

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error unwarning user: ", err.message);
    }
};

const unWarnSelf = async (req: LoggedInUserRequest, res) => {
    let user = req.user;

    try {

        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.punishment.type == "warn") {
            user.punishment.type = "none";
            user.punishment.reason = "";
            user = await user.save();

            res.status(200).json(user);
        } else {
            return res.status(400).json({ error: "You are not warned." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error unwarning self: ", err.message);
    }
};

export {
    warnUser,
    unWarnUser,
    unWarnSelf,
    unsuspendSelf,
    banUser,
    demoteSelf,
    suspendUser,
    activateCode,
};
