import User from "../models/userModel.js";
import { auth } from "../services/firebase.js";
/* interface ProtectRouteRequest extends Request {
    authorization: string;
    user: UserType;
} */
/* The above interface declaration throws a compiler error.
    It will be implemented later once i get less stupid.
    If you're reading this, you are a wonderful person and I hope
    you have a great day. */
const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        let firebaseUser;
        if (!token)
            return res.status(401).json({ message: "Unauthorized" });
        firebaseUser = await auth.verifyIdToken(token);
        if (!firebaseUser)
            return res.status(401).json({ message: "Unauthorized" });
        const user = await User.findOne({ firebaseId: firebaseUser.user_id });
        if (!user)
            return res.status(401).json({ message: "Unauthorized" });
        req.user = user;
        next();
    }
    catch (err) {
        res.status(500).json({ message: err.message });
        console.log("Error in signupUser: ", err.message);
    }
};
export default protectRoute;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdGVjdFJvdXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYmFja2VuZC9taWRkbGV3YXJlcy9wcm90ZWN0Um91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxJQUFJLE1BQU0sd0JBQXdCLENBQUM7QUFDMUMsT0FBTyxFQUFPLElBQUksRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBSXBEOzs7SUFHSTtBQUVKOzs7NEJBR3lCO0FBRXpCLE1BQU0sWUFBWSxHQUFHLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQWtCLEVBQUUsRUFBRTtJQUMzRCxJQUFJLENBQUM7UUFDSixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdkQsSUFBSSxZQUE0QixDQUFDO1FBQ2pDLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBRXJFLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFL0MsSUFBSSxDQUFDLFlBQVk7WUFBRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFFNUUsTUFBTSxJQUFJLEdBQW9CLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUV2RixJQUFJLENBQUMsSUFBSTtZQUFFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUVwRSxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQixJQUFJLEVBQUUsQ0FBQztJQUNSLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkQsQ0FBQztBQUNGLENBQUMsQ0FBQztBQUVGLGVBQWUsWUFBWSxDQUFDIn0=