import { auth } from "../../services/firebase.js";

const generateTokenAndSetCookie = async (token, res) => {
	const idToken = token.toString();


	const expiresIn = 60 * 60 * 24 * 5 * 1000;
	// Create the session cookie. This will also verify the ID token in the process.
	// The session cookie will have the same claims as the ID token.
	// To only allow session cookie setting on recent sign-in, auth_time in ID token
	// can be checked to ensure user was recently signed in before creating a session cookie.
	const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })

	const options = { maxAge: expiresIn, httpOnly: false, secure: true };
	res.cookie('session', sessionCookie, options);
	res.end(JSON.stringify({ status: 'success' }));

	return idToken;
};

export default generateTokenAndSetCookie;
