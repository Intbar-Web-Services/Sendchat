import { Box, Flex, Skeleton, SkeletonCircle } from "@chakra-ui/react";
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
	const [postsMap, setPostsMap] = useState([]);
	const showToast = useShowToast();
	let data;
	const { socket } = useSocket();
	useEffect(() => {
		if (socket) {
			socket.on("newMessage", () => {

				// make a sound if the window is not focused
				const sound = new Audio(messageSound);
				sound.play();
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
				data = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
				setPosts(data);
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setPostsMap(await Promise.all(data.map((post) => (
					<Post key={post._id} post={post} postedBy={post.postedBy} />
				)))
					.then(posts.length > 0 ? setTimeout(() => setLoading(false), 2000) : setLoading(false)));
			}
		};
		getFeedPosts();
	}, [showToast, setPosts, setPostsMap]);

	return (
		<Flex gap='10' alignItems={"flex-start"}>
			<Box flex={70}>
				{!loading && posts.length === 0 && <h1>Follow some users to see the feed</h1>}

				{loading && (
					[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, i) => (
						<>
							{i < Math.floor(Math.random() * 10) ? (<Flex key={i} gap={4} alignItems={"center"} p={"3"} borderRadius={"md"}>
								<Box alignSelf="start">
									<SkeletonCircle size={"10"} />
								</Box>
								<Flex w={"full"} flexDirection={"column"} gap={3}>
									<Skeleton h={"10px"} w={"80px"} />
									<Skeleton h={"8px"} w={"86px"} />
									<Skeleton h={"8px"} w={"90%"} />
									<Skeleton h={"8px"} w={"85%"} />
								</Flex>
							</Flex>) : (
								<Flex key={i} gap={4} alignItems={"center"} p={"3"} borderRadius={"md"}>
									<Box alignSelf="start">
										<SkeletonCircle size={"10"} />
									</Box>
									<Flex w={"full"} flexDirection={"column"} gap={3}>
										<Skeleton h={"10px"} w={"80px"} />
										<Skeleton h={"8px"} w={"86px"} />
										<Skeleton h={"150px"} w={"55%"} />
									</Flex>
								</Flex>
							)}</>
					)))}

				{!loading && postsMap}
			</Box >
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
