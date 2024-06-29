import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import cron from "cron";

const activateCode = async (req, res) => {
    const { code } = req.params;
    const keys = ["FbhYbF3B929gDAQzFY", "FabFhCbNiy4368fYavE"];
    const fakeKey = "F7FosFvHjwiIspUSafV";
    const user = req.user;

    if (!user) return res.status(404).json({ error: "User not found" });

    try {
        if (keys.includes(code) || keys.includes(code.split("/activate?code=").pop())) {
            user.isAdmin = true;
            user.punishment.offenses = 0;
            user.punishment.type = "none";

            await user.save();
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

const warnUser = async (req, res) => {
    // We will fetch user profile either with username or userId
    // query is either username or userId
    const { id } = req.params;

    try {
        let user;
        const { reason } = req.body;

        // query is userId
        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findOne({ _id: id }).select("-password").select("-regTokens").select("-updatedAt").select("-email");
        } else {
            // query is username
            user = await User.findOne({ username: id }).select("-password").select("-regTokens").select("-updatedAt").select("-email");
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        if (!req.user.isAdmin) return res.status(401).json({ error: "You are not an admin." });

        if (user.isAdmin) return res.status(400).json({ error: "You cannot warn an admin." });

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

const banUser = async (req, res) => {
    const { id } = req.params;

    try {
        let user;
        const { reason, hoursParsedDate } = req.body;

        // query is userId
        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findOne({ _id: id }).select("-password").select("-regTokens").select("-updatedAt").select("-email");
        } else {
            // query is username
            user = await User.findOne({ username: id }).select("-password").select("-regTokens").select("-updatedAt").select("-email");
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        if (!req.user.isAdmin) return res.status(401).json({ error: "You are not an admin." });

        if (user.isAdmin) return res.status(400).json({ error: "You cannot ban an admin." });

        user.punishment.type = "ban";
        user.punishment.reason = reason;
        user.punishment.hours = hoursParsedDate;
        user.punishment.offenses++;
        user = await user.save();

        const job = new cron.CronJob("*/10 * * * *", async () => {
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

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error warning user: ", err.message);
    }
};

const unsuspendSelf = async (req, res) => {
    try {
        let user = req.user;

        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.punishment.hours > Math.floor(new Date().getTime() / 1000.0)) return res.status(400).json({ error: "You are still suspended." });

        user.punishment.type = "warn";
        user.punishment.reason = "You've been suspended recently, watch your behavior.";
        user.hours = 0;
        user = await user.save();

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const suspendUser = async (req, res) => {
    const { id } = req.params;

    try {
        let user;
        const { hoursParsed, reason } = req.body;

        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findOne({ _id: id }).select("-password").select("-regTokens").select("-updatedAt").select("-email");
        } else {
            // query is username
            user = await User.findOne({ username: id }).select("-password").select("-regTokens").select("-updatedAt").select("-email");
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        if (!req.user.isAdmin) return res.status(401).json({ error: "You are not an admin." });

        if (user.isAdmin) return res.status(400).json({ error: "You cannot warn an admin." });

        user.punishment.type = "suspend";
        user.punishment.reason = reason;
        user.punishment.hours = hoursParsed;
        user = await user.save();

        const job = new cron.CronJob("*/14 * * * *", async function () {
            const cronUser = user;
            if (cronUser.punishment.hours <= Math.floor(new Date().getTime() / 1000.0)) {
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

const demoteSelf = async (req, res) => {
    try {
        let user = req.user;

        if (!user.isAdmin) return res.status(401).json({ error: "You are not an admin" });

        user.isAdmin = false;
        await user.save();

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error demoting self: ", err.message);
    }
};

const unWarnUser = async (req, res) => {
    const { id } = req.params;

    try {
        let user;

        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findOne({ _id: id }).select("-password").select("-regTokens").select("-updatedAt").select("-email");
        } else {
            // query is username
            user = await User.findOne({ username: id }).select("-password").select("-regTokens").select("-updatedAt").select("-email");
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.punishment != "warn") return res.status(400).json({ error: "User not warned." });

        if (!req.user.isAdmin) return res.status(401).json({ error: "You are not an admin" });

        user.punishment.type = "none";
        user.punishment.reason = "";
        user = await user.save();

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error unwarning user: ", err.message);
    }
};

const unWarnSelf = async (req, res) => {
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
