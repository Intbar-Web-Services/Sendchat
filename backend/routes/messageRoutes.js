import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import { checkContent } from "../server.js";
import { getMessages, sendMessage, getConversations } from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations);
router.get("/:otherUserId", protectRoute, getMessages);
router.post("/", protectRoute, checkContent, sendMessage);

export default router;
