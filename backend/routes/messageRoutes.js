import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import { getMessages, sendMessage, getConversations } from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", getConversations);
router.get("/:otherUserId", getMessages);
router.post("/", sendMessage);

export default router;
