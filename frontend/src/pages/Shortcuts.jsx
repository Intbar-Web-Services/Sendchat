import { Divider } from "@chakra-ui/react";
export default function Shortcuts() {
	return (
		<>
			<h1>Keyboard Shortcuts</h1>
			<Divider my={4} />

			<h3>Ctrl + / - View Shortcuts</h3>
			<h3>Alt + N - Create New Post {`(on pages where the Post button is visible)`}</h3>
			<h3>Alt + R - Reply to Post {`(only when looking at a post's page)`}</h3>
			<h3>Escape - Close the Post you are looking at {`(only when looking at a post's page)`}</h3>
			<h3>Alt + H - Home Feed</h3>
			<h3>Alt + C - Chats</h3>
			<h3>Alt + L - Quick IWS Logout</h3>
			<h3>Alt + U - View Profile</h3>
			<h3>Ctrl + , - Edit Profile</h3>
			<h3>Alt + S - Settings</h3>
			<h3>Alt + M - Toggle between light and dark mode</h3>
		</>
	);
};