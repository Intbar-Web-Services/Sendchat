import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const activateCode = async (req, res) => {
    const { code } = req.params;
    const keys = ["FbhYbF3B929+gDAQzFY"];
    const user = req.user;

    if (!user) return res.status(404).json({ error: "User not found" });

    try {
        if (keys.includes(code)) {
            user.isAdmin = true;
            user.punishment.offenses = 0;
            user.punishment.type = "none";

            await user.save();
            return res.status(200).json(user);
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
        const { hours, reason } = req.body;

        // query is userId
        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findOne({ _id: id }).select("-password").select("-updatedAt");
        } else {
            // query is username
            user = await User.findOne({ username: id }).select("-password").select("-updatedAt");
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        if (!req.user.isAdmin) return res.status(401).json({ error: "You are not an admin." });

        if (user.isAdmin) return res.status(400).json({ error: "You cannot warn an admin." });

        user.punishment.type = "warn";
        user.punishment.hours = hours;
        user.punishment.reason = reason;
        user.punishment.offenses++;
        user = await user.save();

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error warning user: ", err.message);
    }
};

const unWarnUser = async (req, res) => {
    const { id } = req.params;

    try {
        let user;

        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findOne({ _id: id }).select("-password").select("-updatedAt");
        } else {
            // query is username
            user = await User.findOne({ username: id }).select("-password").select("-updatedAt");
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.punishment != "warn") return res.status(400).json({ error: "User not warned." });
        if (req.user.isAdmin) {
            if (user.punishment.type == "warn") {
                user.punishment.type = "none";
                user.punishment.reason = "";
                user = await user.save();

                res.status(200).json(user);
            }
        } else {
            return res.status(401).json({ error: "You are not an admin" });
        }
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
    activateCode,
};