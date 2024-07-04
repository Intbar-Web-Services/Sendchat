import path from "path";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import User from "./models/userModel.js";
import Post from "./models/postModel.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import punishmentRoutes from "./routes/punishmentRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import job from "./cron/cron.js";
import cron from "cron";
import { auth } from "./services/firebase.js";
dotenv.config();
const app = express();
connectDB();
job.start();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
const pattern = /(\b\W*f\W*a\W*g\W*(g\W*o\W*t\W*t\W*a\W*r\W*d)?|m\W*a\W*r\W*i\W*c\W*o\W*s?|c\W*o\W*c\W*k\W*s?\W*u\W*c\W*k\W*e\W*r\W*(s\W*i\W*n\W*g)?|\bn\W*i\W*g\W*(\b|g\W*(a\W*|e\W*r)?s?)\b|d\W*i\W*n\W*d\W*u\W*(s?)|m\W*u\W*d\W*s\W*l\W*i\W*m\W*e\W*s?|k\W*i\W*k\W*e\W*s?|m\W*o\W*n\W*g\W*o\W*l\W*o\W*i\W*d\W*s?|t\W*o\W*w\W*e\W*l\W*\s\W*h\W*e\W*a\W*d\W*s?|\bs\W*p\W*i\W*(c\W*|\W*)s?\b|\bch\W*i\W*n\W*k\W*s?|n\W*i\W*g\W*l\W*e\W*t\W*s?|b\W*e\W*a\W*n\W*e\W*r\W*s?|\bn\W*i\W*p\W*s?\b|\bco\W*o\W*n\W*s?\b|j\W*u\W*n\W*g\W*l\W*e\W*\s\W*b\W*u\W*n\W*n\W*(y\W*|i\W*e\W*s?)|j\W*i\W*g\W*g?\W*a\W*b\W*o\W*o\W*s?|\bp\W*a\W*k\W*i\W*s?\b|r\W*a\W*g\W*\s\W*h\W*e\W*a\W*d\W*s?|g\W*o\W*o\W*k\W*s?|c\W*u\W*n\W*t\W*s?\W*(e\W*s\W*|i\W*n\W*g\W*|y)?|t\W*w\W*a\W*t\W*s?|f\W*e\W*m\W*i\W*n\W*a\W*z\W*i\W*s?|w\W*h\W*o\W*r\W*(e\W*s?\W*|i\W*n\W*g)|\bs\W*l\W*u\W*t\W*(s\W*|t\W*?\W*y)?|\btr\W*a\W*n\W*n?\W*(y\W*|i\W*e\W*s?)|l\W*a\W*d\W*y\W*b\W*o\W*y\W*(s?))/gmi;
const bannedUsers = await User.find({ 'punishment.type': { $exists: true, $eq: 'ban' } });
if (bannedUsers) {
    bannedUsers.map((user) => {
        const job = new cron.CronJob("*/10 * * * *", async () => {
            const cronUser = user;
            const uid = cronUser.firebaseId;
            if (cronUser.punishment.hours + 864000 <= Math.floor(new Date().getTime() / 1000.0)) {
                if (cronUser.punishment?.type === "ban") {
                    const posts = await Post.find();
                    posts.map((post) => {
                        if (post.replies) {
                            post.replies.map((reply) => {
                                bannedUsers.map((bannedUser) => {
                                    if (reply.userId.toString() == bannedUser._id.toString()) {
                                        reply.username = `deletedUser_${cronUser._id}`;
                                        reply.name = `Deleted User ${cronUser._id}`;
                                        reply.userProfilePic = "";
                                    }
                                });
                            });
                        }
                        post.save();
                    });
                    cronUser.username = `deletedUser_${cronUser._id}`;
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
    });
}
const suspendedUsers = await User.find({ 'punishment.type': { $exists: true, $eq: 'suspend' } });
if (suspendedUsers) {
    suspendedUsers.map((user) => {
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
    });
}
export async function punishmentCheck(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    let firebaseUser;
    firebaseUser = await auth.verifyIdToken(token);
    if (!firebaseUser)
        return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findOne({ firebaseId: firebaseUser.user_id });
    if (!user)
        return res.status(401).json({ message: "Unauthorized" });
    if (user.punishment?.type != "none") {
        return res.status(401).json({ error: "You are currently punished" });
    }
    next();
}
;
export async function checkSignUpContent(req, res, next) {
    const checkContentRecursive = (value) => {
        const patternInstance = new RegExp(pattern);
        if (typeof value === 'string' && patternInstance.exec(value)) {
            return true;
        }
        else if (typeof value === 'object' && value !== null) {
            for (let key in value) {
                // @ts-ignore
                if (checkContentRecursive(value[key])) {
                    return true;
                }
            }
        }
        return false;
    };
    if (checkContentRecursive(req.body)) {
        return res.status(400).json({ error: "Contains blacklisted word." });
    }
    next();
}
;
export async function checkContent(req, res, next) {
    const checkContentRecursive = (value) => {
        const patternInstance = new RegExp(pattern);
        if (typeof value === 'string' && patternInstance.exec(value)) {
            return true;
        }
        else if (typeof value === 'object' && value !== null) {
            for (let key in value) {
                if (key != "imgUrl") {
                    // @ts-ignore
                    if (checkContentRecursive(value[key])) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    if (checkContentRecursive(req.body)) {
        const token = req.headers.authorization?.split(" ")[1];
        let firebaseUser;
        if (token) {
            firebaseUser = await auth.verifyIdToken(token);
        }
        const user = await User.findOne({ firebaseId: firebaseUser.user_id });
        const firebaseUserAccount = await auth.getUser(firebaseUser.user_id);
        user.punishment.offenses++;
        if (!firebaseUserAccount.customClaims['admin']) {
            if (user.punishment.offenses >= 2 && user.punishment.offenses <= 3) {
                user.punishment.type = "warn";
                user.punishment.reason = "You have said too many blacklisted words. If you do this more you will get banned";
            }
            else if (user.punishment.offenses >= 3 && user.punishment.offenses <= 20) {
                user.punishment.type = "suspend";
                user.punishment.hours = Math.floor(new Date().getTime() / 1000.0) + 259200;
                user.punishment.reason = "You have said too many blacklisted words. You are now supended";
                const job = new cron.CronJob("*/14 * * * *", async function () {
                    const cronUser = user;
                    if (cronUser.punishment.hours <= Math.floor(new Date().getTime() / 1000.0)) {
                        cronUser.punishment.type = "warn";
                        cronUser.punishment.reason = "You've been suspended recently, watch your behavior.";
                        cronUser.punishment.hours = 0;
                        await cronUser.save();
                        job.stop();
                    }
                });
                job.start();
            }
            else if (user.punishment.offenses > 20) {
                user.punishment.type = "ban";
                user.punishment.reason = "ban";
                user.punishment.hours = 1;
                user.punishment.offenses++;
                const job = new cron.CronJob("0/45 * * * *", async () => {
                    const cronUser = user;
                    const uid = cronUser.firebaseId;
                    if (cronUser.punishment.hours + 864000 <= Math.floor(new Date().getTime() / 1000.0)) {
                        if (cronUser.punishment.type === "ban") {
                            cronUser.username = `deletedUser_${cronUser._id}`;
                            cronUser.name = `Deleted User ${cronUser._id}`;
                            cronUser.bio = "";
                            cronUser.punishment.type = "none";
                            cronUser.profilePic = "";
                            cronUser.isDeleted = true;
                            cronUser.password = `${Date.now()}`;
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
            return res.status(400).json({ error: "Contains blacklisted word." });
        }
    }
    next();
}
;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Middlewares 
app.use(express.json({ limit: "50mb" })); // To parse JSON data in the req.body
app.use(express.urlencoded({ extended: true })); // To parse form data in the req.body
app.use(cookieParser());
// Routes
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/punishments", punishmentRoutes);
// http://localhost:5000 => backend,frontend
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.use(express.static(path.join(__dirname, "/desktop/dist")));
    app.use("/app", (req, res) => {
        res.sendFile(path.resolve(__dirname, "desktop", "dist", "index.html"));
    });
    // react app
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}
export { app };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYmFja2VuZC9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBQ3hCLE9BQU8sT0FBa0MsTUFBTSxTQUFTLENBQUM7QUFDekQsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQzVCLE9BQU8sU0FBUyxNQUFNLG1CQUFtQixDQUFDO0FBQzFDLE9BQU8sWUFBWSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLFVBQVUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLElBQUksTUFBTSx1QkFBdUIsQ0FBQztBQUN6QyxPQUFPLElBQUksTUFBTSx1QkFBdUIsQ0FBQztBQUN6QyxPQUFPLFVBQVUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLGFBQWEsTUFBTSwyQkFBMkIsQ0FBQztBQUN0RCxPQUFPLGdCQUFnQixNQUFNLDhCQUE4QixDQUFBO0FBQzNELE9BQU8sRUFBRSxFQUFFLElBQUksVUFBVSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzlDLE9BQU8sR0FBRyxNQUFNLGdCQUFnQixDQUFDO0FBRWpDLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUN4QixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFJOUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hCLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBRXRCLFNBQVMsRUFBRSxDQUFDO0FBQ1osR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBRVosTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDO0FBQ3RDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUVqQyxNQUFNLE9BQU8sR0FBRyw0NEJBQTQ0QixDQUFDO0FBRTc1QixNQUFNLFdBQVcsR0FB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