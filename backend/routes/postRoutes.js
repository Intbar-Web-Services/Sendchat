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

const router = express.Router();

router.get("/feed", protectRoute, getFeedPosts);
router.get("/:id", getPost);
router.get("/", getPosts);
router.get("/user/:username", getUserPosts);
router.post("/create", protectRoute, checkContent, createPost);
router.delete("/:id", protectRoute, deletePost);
router.put("/like/:id", protectRoute, likeUnlikePost);
router.put("/reply/:id", protectRoute, checkContent, replyToPost);

export default router;
