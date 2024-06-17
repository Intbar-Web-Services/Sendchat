import express from "express";
import {
	followUnFollowUser,
	getUserProfile,
	loginUser,
	logoutUser,
	signupUser,
	updateUser,
	getSuggestedUsers,
	freezeAccount,
} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";
import { checkContent } from "../server.js";
import { punishmentCheck } from "../server.js";
import { checkSignUpContent } from "../server.js";

const router = express.Router();

router.get("/profile/:query", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/signup", checkSignUpContent, signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followUnFollowUser); // Toggle state(follow/unfollow)
router.put("/update/:id", protectRoute, punishmentCheck, checkContent, updateUser);
router.put("/freeze", protectRoute, freezeAccount);

export default router;
