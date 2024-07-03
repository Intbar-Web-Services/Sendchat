import User from "../models/userModel.js";
import { app, auth } from "../services/firebase.js";

const protectRoute = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		let firebaseUser;
		if (token) {
			firebaseUser = await auth.verifyIdToken(token);
		}

		if (!firebaseUser) return res.status(401).json({ message: "Unauthorized" });
		
		const user = await User.findOne({ firebaseId: firebaseUser.user_id });

		if (!user) return res.status(401).json({ message: "Unauthorized" });

		req.user = user;

		next();
	} catch (err) {
		res.status(500).json({ message: err.message });
		console.log("Error in signupUser: ", err.message);
	}
};

export default protectRoute;
