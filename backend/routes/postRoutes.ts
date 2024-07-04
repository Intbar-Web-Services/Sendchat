import express from "express";
import { checkContent } from "../server.js";
import {
	createPost,
	deletePost,
	getPost,
	getPosts,
	likeUnlikePost,
	replyToPost,
	getFeedPosts,
	getUserPosts,
} from "../controllers/postController.js";
import protectRoute from "../middlewares/protectRoute.js";
import { punishmentCheck } from "../server.js";

const router = express.Router();

router.get("/feed", protectRoute, punishmentCheck, getFeedPosts);
router.get("/:id", getPost);
router.get("/", getPosts);
router.get("/user/:username", getUserPosts);
router.post("/create", protectRoute, punishmentCheck, checkContent, createPost);
router.delete("/:id", protectRoute, punishmentCheck, deletePost);
router.put("/like/:id", protectRoute, punishmentCheck, likeUnlikePost);
router.put("/reply/:id", protectRoute, punishmentCheck, checkContent, replyToPost);

export default router;
