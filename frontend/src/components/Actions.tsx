import {
	Box,
	Button,
	Flex,
	FormControl,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	useToast,
	ModalOverlay,
	Text,
	useDisclosure,
} from "@chakra-ui/react";
import { useState, useCallback, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useLocation } from "react-router-dom";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";
import getCurrentUserId from "../user.js";
import PostType, { Reply } from "../contracts/post.js";

const Actions = ({ post }: { post: PostType }) => {
	const user = useRecoilValue(userAtom);
	const [liked, setLiked] = useState(post.likes.includes(user?._id!));
	const [posts, setPosts] = useRecoilState(postsAtom);
	const [isLiking, setIsLiking] = useState(false);
	const [isReplying, setIsReplying] = useState(false);
	const [reply, setReply] = useState("");
	const toast = useToast();
	let location = useLocation();

	const showToast = useShowToast();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const copyURL = () => {
		const currentURL = window.location.href
		// Assuming currentURL is already defined
		const url = new URL(currentURL);

		// Extract the base URL (including protocol and hostname)
		const baseURL = `${url.protocol}//${url.hostname}/`;
		const finalURL = `${baseURL}user/${user?.username}/post/${post._id}`;
		navigator.clipboard.writeText(finalURL).then(() => {
			toast({
				title: "Success.",
				status: "success",
				description: "Post link copied.",
				duration: 3000,
				isClosable: true,
			});
		});
	};


	const handleLikeAndUnlike = async () => {
		if (!user) return showToast("Error", "You must be logged in to like a post", "error");
		if (isLiking) return;
		setIsLiking(true);
		try {
			const res = await fetch("/api/posts/like/" + post._id, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"authorization": `Bearer ${await getCurrentUserId()}`,
				},
			});
			const data: { success?: string | boolean, error?: string } = await res.json();
			if (data.error) return showToast("Error", data.error, "error");

			if (!liked) {
				// add the id of the current user to post.likes array
				const updatedPosts = posts.map((p) => {
					if (p._id === post._id) {
						return { ...p, likes: [...p.likes, user._id] as string[] };
					}
					return p;
				});
				setPosts(updatedPosts);
			} else {
				// remove the id of the current user from post.likes array
				const updatedPosts = posts.map((p) => {
					if (p._id === post._id) {
						return { ...p, likes: p.likes.filter((id) => id !== user._id) };
					}
					return p;
				});
				setPosts(updatedPosts);
			}

			setLiked(!liked);
		} catch (error: any) {
			showToast("Error", error.message, "error");
		} finally {
			setIsLiking(false);
		}
	};

	const handleReply = async () => {
		if (!user) return showToast("Error", "You must be logged in to reply to a post", "error");
		if (isReplying) return;
		setIsReplying(true);
		try {
			const res = await fetch("/api/posts/reply/" + post._id, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"authorization": `Bearer ${await getCurrentUserId()}`,
				},
				body: JSON.stringify({ text: reply }),
			});
			const data: Reply & { success?: string | boolean, error?: string } = await res.json();
			if (data.error) {
				if (data.error == "You are currently punished") {
					window.location.pathname = "/";
				}
				return showToast("Error", data.error, "error")
			};

			const updatedPosts: PostType[] = posts.map((p) => {
				if (p._id === post._id) {
					return { ...p, replies: [...p.replies, data] };
				}
				return p;
			});
			setPosts(updatedPosts);
			showToast("Success", "Reply posted successfully", "success");
			onClose();
			setReply("");
		} catch (error: any) {
			showToast("Error", error.message, "error");
		} finally {
			setIsReplying(false);
		}
	};

	const handleKeyPress = useCallback((event: any) => {
		if (location.pathname.includes("/post")) {
			if (event.altKey && event.key === 'r') {
				onOpen();
			}
		}
	}, []);


	useEffect(() => {
		// attach the event listener
		document.addEventListener('keydown', handleKeyPress);

		// remove the event listener
		return () => {
			document.removeEventListener('keydown', handleKeyPress);
		};
	}, [handleKeyPress]);

	return (
		<Flex flexDirection='column'>
			<Flex gap={3} my={2} onClick={(e) => e.preventDefault()}>
				<svg
					aria-label='Like'
					color={liked ? "rgb(237, 73, 86)" : ""}
					fill={liked ? "rgb(237, 73, 86)" : "transparent"}
					height='19'
					role='img'
					viewBox='0 0 24 22'
					width='20'
					onClick={handleLikeAndUnlike}
				>
					<title>Like</title>
					<path
						d='M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z'
						stroke='currentColor'
						strokeWidth='2'
					></path>
				</svg>

				<svg
					aria-label='Reply'
					color=''
					fill=''
					height='20'
					role='img'
					viewBox='0 0 24 24'
					width='20'
					onClick={onOpen}
				>
					<title>Reply</title>
					<path
						d='M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z'
						fill='none'
						stroke='currentColor'
						strokeLinejoin='round'
						strokeWidth='2'
					></path>
				</svg>

				<svg
					aria-label='Share'
					color=''
					fill='rgb(243, 245, 247)'
					height='20'
					role='img'
					viewBox='0 0 24 24'
					width='20'
					onClick={copyURL}
				>
					<title>Share</title>
					<line
						fill='none'
						stroke='currentColor'
						strokeLinejoin='round'
						strokeWidth='2'
						x1='22'
						x2='9.218'
						y1='3'
						y2='10.083'
					></line>
					<polygon
						fill='none'
						points='11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334'
						stroke='currentColor'
						strokeLinejoin='round'
						strokeWidth='2'
					></polygon>
				</svg>
			</Flex>

			<Flex gap={2} alignItems={"center"}>
				<Text color={"gray.light"} fontSize='sm'>
					{post.replies.length} replies
				</Text>
				<Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
				<Text color={"gray.light"} fontSize='sm'>
					{post.likes.length} likes
				</Text>
			</Flex>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader></ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<FormControl>
							<Input
								placeholder='Type your reply here...'
								value={reply}
								onChange={(e) => setReply(e.target.value)}
							/>
						</FormControl>
					</ModalBody>

					<ModalFooter>
						<Button colorScheme='blue' size={"sm"} mr={3} isLoading={isReplying} onClick={handleReply}>
							Reply
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Flex>
	);
};

export default Actions;

