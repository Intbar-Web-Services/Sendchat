import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import { checkContent } from "../server.js";
import { getMessages, sendMessage, getConversations, subscribe } from "../controllers/messageController.js";
import { punishmentCheck } from "../server.js";

const router = express.Router();

router.get("/conversations", protectRoute, punishmentCheck, getConversations);
router.get("/:otherUserId", protectRoute, punishmentCheck, getMessages);
router.post("/", protectRoute, punishmentCheck, checkContent, sendMessage);
router.post("/subscribe", protectRoute, subscribe);

export default router;
