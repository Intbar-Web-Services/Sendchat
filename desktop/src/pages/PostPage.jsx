import { Avatar, Box, Button, Divider, Flex, Image, Spinner, Text, useColorModeValue, Stack } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import Actions from "../components/Actions";
import { useEffect, useCallback } from "react";
import Comment from "../components/Comment";
import useGetUserProfile from "../hooks/useGetUserProfile";
import useShowToast from "../hooks/useShowToast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { DeleteIcon } from "@chakra-ui/icons";
import postsAtom from "../atoms/postsAtom";
import { useSocket } from "../context/SocketContext.jsx";
import messageSound from "../assets/sounds/message.mp3";
import Linkify from "react-linkify";

const PostPage = () => {
	const { user, loading } = useGetUserProfile();
	const [posts, setPosts] = useRecoilState(postsAtom);
	const showToast = useShowToast();
	const { pid } = useParams();
	const currentUser = useRecoilValue(userAtom);
	const navigate = useNavigate();
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

					const body = message.image ? "Sent an image" : message.text

					new Notification(data.name, {
						body,
						image: message.img,
					});
				}
			});

			return () => socket.off("newMessage");
		}
	}, [socket]);


	const currentPost = posts[0];

	const handleKeyPress = useCallback((event) => {
		if (event.key === "Escape") {
			navigate(-1);
		}
	}, [navigate]);

	useEffect(() => {
		// attach the event listener
		document.addEventListener('keydown', handleKeyPress);

		// remove the event listener
		return () => {
			document.removeEventListener('keydown', handleKeyPress);
		};
	}, [handleKeyPress]);

	useEffect(() => {
		const getPost = async () => {
			setPosts([]);
			try {
				const res = await fetch(`/api/posts/${pid}`);
				const data = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
				setPosts([data]);
			} catch (error) {
				showToast("Error", error.message, "error");
			}
		};
		getPost();
	}, [showToast, pid, setPosts]);

	const handleDeletePost = async () => {
		try {
			if (!window.confirm("Are you sure you want to delete this post?")) return;

			const res = await fetch(`/api/posts/${currentPost._id}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (data.error) {
				showToast("Error", data.error, "error");
				return;
			}
			showToast("Success", "Post deleted", "success");
			navigate(`/user/${user.username}`);
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	if (!user && loading) {
		return (
			<Flex justifyContent={"center"}>
				<Spinner size={"xl"} />
			</Flex>
		);
	}


	if (!currentPost) return null;

	return (
		<>
			<Button
				position={"fixed"}
				bottom={10}
				right={5}
				// eslint-disable-next-line react-hooks/rules-of-hooks
				bg={useColorModeValue("gray.300", "gray.dark")}
				onClick={() => { navigate(-1); }}
				size={{ base: "sm", sm: "md" }}
			>
				<CloseIcon />
			</Button>
			<Flex justifyContent={"space-between"}>
				<Link to={`/user/${user.username}`}>
					<Flex
						w={"full"}
						alignItems={"center"}
						gap={3}
						_hover={{
							cursor: "pointer",
							// eslint-disable-next-line react-hooks/rules-of-hooks
							bg: useColorModeValue("gray.9000", "black.dark"),
							// eslint-disable-next-line react-hooks/rules-of-hooks
							color: useColorModeValue("black.dark", "white"),
						}}
					>
						<Avatar src={user.profilePic} size={"md"} name={user.name} />
						<Stack w={"full"} alignItems={"left"} spacing={0}>
							<Text fontSize='sm' fontWeight='bold'>
								{user.name}
							</Text>
							{/* eslint-disable-next-line react-hooks/rules-of-hooks */}
							<Text fontWeight='400' display={"flex"} alignItems={"center"} color={useColorModeValue("black", "gray.400")}>
								{`(`}@{user.username}{`)`}
							</Text>
						</Stack>
					</Flex>
				</Link>
				<Flex gap={4} alignItems={"center"}>
					<Text fontSize={"xs"} width={36} textAlign={"right"} color={"gray.light"}>
						{formatDistanceToNow(new Date(currentPost.createdAt))} ago
					</Text>

					{currentUser?._id === user._id && (
						<DeleteIcon size={20} cursor={"pointer"} onClick={handleDeletePost} />
					)}
				</Flex>
			</Flex>
			<Linkify
				componentDecorator={(decoratedHref, decoratedText, key) => (
					<a target="blank" href={decoratedHref} key={key}>
						{decoratedText}
					</a>
				)}
			>
				<Text my={3}>{currentPost.text}</Text>
			</Linkify>

			{currentPost.img && (
				<Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"}>
					<Image src={currentPost.img} w={"full"} />
				</Box>
			)}

			<Flex gap={3} my={3}>
				<Actions post={currentPost} />
			</Flex>

			<Divider my={4} />

			<Flex justifyContent={"space-between"}>
				<Flex gap={2} alignItems={"center"}>
					<Text fontSize={"2xl"}>👋</Text>
					<Text color={"gray.light"}>Remember to keep replies safe and respectful!</Text>
				</Flex>
			</Flex>

			<Divider my={4} />
			{currentPost.replies.map((reply) => (
				<Comment
					key={reply._id}
					reply={reply}
					lastReply={reply._id === currentPost.replies[currentPost.replies.length - 1]._id}
				/>
			))}
		</>
	);
};

export default PostPage;
