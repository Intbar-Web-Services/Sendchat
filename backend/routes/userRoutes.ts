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

router.get("/profile/:query", getUserProfile);
router.get("/suggested", protectRoute, punishmentCheck, getSuggestedUsers);
router.post("/signup", checkSignUpContent, signupUser);
router.post("/login", loginUser);
router.post("/logout", protectRoute, logoutUser);
router.post("/follow/:id", protectRoute, punishmentCheck, followUnFollowUser); // Toggle state(follow/unfollow)
router.put("/update/:id", protectRoute, punishmentCheck, checkContent, updateUser);
router.put("/freeze", protectRoute, punishmentCheck, freezeAccount);

export default router;
