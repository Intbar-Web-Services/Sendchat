import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import SuggestedUsers from "../components/SuggestedUsers";
import { useSocket } from "../context/SocketContext.jsx";
import messageSound from "../assets/sounds/message.mp3";


const HomePage = () => {
	const [posts, setPosts] = useRecoilState(postsAtom);
	const [loading, setLoading] = useState(true);
	const showToast = useShowToast();
	const { socket } = useSocket();
	useEffect(() => {
		if (socket) {
			socket.on("newMessage", async (message) => {

				// make a sound if the window is not focused
				const sound = new Audio(messageSound);
				sound.play();

				const res = await fetch(`/api/users/profile/${message.sender}`);
				const data = res.json();

				if (data.error)
					console.log(`Error sending message for message: ${message} from user: ${data}`);

				// make a sound if the window is not focused
				if (!document.hasFocus()) {
					new Audio(messageSound).play();

					const body = message.img ? "Sent an image" : message.text

					new Notification(data.name, {
						body,
						image: message.img,
					});
				}
			});

			return () => socket.off("newMessage");
		}
	}, [socket]);

	useEffect(() => {
		const getFeedPosts = async () => {
			setLoading(true);
			setPosts([]);
			try {
				const res = await fetch("/api/posts/feed");
				const data = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
				setPosts(data);
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setLoading(false);
			}
		};
		getFeedPosts();
	}, [showToast, setPosts]);

	return (
		<Flex gap='10' alignItems={"flex-start"}>
			<Box flex={70}>
				{!loading && posts.length === 0 && <h1>Follow some users to see the feed</h1>}

				{loading && (
					<Flex justify='center'>
						<Spinner size='xl' />
					</Flex>
				)}

				{posts.map((post) => (
					<Post key={post._id} post={post} postedBy={post.postedBy} />
				))}
			</Box>
			<Box
				flex={30}
				display={{
					base: "none",
					md: "block",
				}}
			>
				<SuggestedUsers />
			</Box>
		</Flex>
	);
};

export default HomePage;
