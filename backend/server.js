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
import punishmentRoutes from "./routes/punishmentRoutes.js"
import { v2 as cloudinary } from "cloudinary";
import job from "./cron/cron.js";
import jwt from "jsonwebtoken";
import cron from "cron";

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
      if (cronUser.punishment.hours + 864000 <= Math.floor(new Date().getTime() / 1000.0)) {
        if (cronUser.punishment.type === "ban") {
          const posts = Post.find();
          posts.map((post) => {
            if (post.replies) {
              post.replies.map((reply) => {
                bannedUsers.map((bannedUser) => {
                  if (reply.userId.toString() == bannedUser._id.toString()) {
                    reply.username = `deletedUser_${cronUser._id}`
                    reply.name = `Deleted User ${cronUser._id}`
                    reply.userProfilePic = "";
                  }
                });
              });
            }

            post.save()
          });
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
  const token = req.cookies.jwt;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.userId).select("-password");

  if (user.punishment.type != "none") {
    return res.status(401).json({ error: "You are currently punished" });
  }

  next();
};

export async function checkSignUpContent(req, res, next) {
  const checkContentRecursive = (value) => {
    const patternInstance = new RegExp(pattern);
    if (typeof value === 'string' && patternInstance.exec(value)) {
      return true;
    } else if (typeof value === 'object' && value !== null) {
      for (let key in value) {
        if (checkContentRecursive(value[key])) {
          return true;
        }
      }
    }
    return false;
  }

  if (checkContentRecursive(req.body)) {
    return res.status(400).json({ error: "Contains blacklisted word." });
  }

  next();
};

export async function checkContent(req, res, next) {
  const checkContentRecursive = (value) => {
    const patternInstance = new RegExp(pattern);
    if (typeof value === 'string' && patternInstance.exec(value)) {
      return true;
    } else if (typeof value === 'object' && value !== null) {
      for (let key in value) {
        if (key != "imgUrl") {
          if (checkContentRecursive(value[key])) {
            return true;
          }
        }
      }
    }
    return false;
  }

  if (checkContentRecursive(req.body)) {
    const token = req.cookies.jwt;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    user.punishment.offenses++;
    if (!user.isAdmin) {
      if (user.punishment.offenses >= 2 && user.punishment.offenses <= 3) {
        user.punishment.type = "warn";
        user.punishment.reason = "You have said too many blacklisted words. If you do this more you will get banned"
      } else if (user.punishment.offenses >= 3 && user.punishment.offenses <= 20) {
        user.punishment.type = "suspend";
        user.punishment.hours = Math.floor(new Date().getTime() / 1000.0) + 259200;
        user.punishment.reason = "You have said too many blacklisted words. You are now supended"

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
      return res.status(400).json({ error: "Contains blacklisted word." });
    }
  }

  next();
};

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