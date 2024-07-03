import { NextFunction, Request, Response } from "express";
import User from "../models/userModel.js";
import { app, auth } from "../services/firebase.js";
import { default as UserType } from "../contracts/user.js";
import { DecodedIdToken } from "firebase-admin/auth";

/* interface ProtectRouteRequest extends Request {
	authorization: string;
	user: UserType;
} */

/* The above interface declaration throws a compiler error.
	It will be implemented later once i get less stupid.
	If you're reading this, you are a wonderful person and I hope
	you have a great day. */

const protectRoute = async (req, res, next: NextFunction) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		let firebaseUser: DecodedIdToken;
		if (!token) return res.status(401).json({ message: "Unauthorized" });

		firebaseUser = await auth.verifyIdToken(token);

		if (!firebaseUser) return res.status(401).json({ message: "Unauthorized" });

		const user: UserType | null = await User.findOne({ firebaseId: firebaseUser.user_id });

		if (!user) return res.status(401).json({ message: "Unauthorized" });

		req.user = user;

		next();
	} catch (err) {
		res.status(500).json({ message: err.message });
		console.log("Error in signupUser: ", err.message);
	}
};

export default protectRoute;
