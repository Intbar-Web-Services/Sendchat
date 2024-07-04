import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/image";
import { Box, Flex, Text, Stack } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/react"
import { Link, useNavigate } from "react-router-dom";
import Actions from "./Actions";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postsAtom";
import Linkify from "react-linkify";
import PostType from "../contracts/post";
import UserType from "../contracts/user";

const Post = ({ post, postedBy }: { post: PostType, postedBy: string }) => {
	const [user, setUser] = useState<UserType | null>(null);
	const showToast = useShowToast();
	let currentUser = useRecoilValue(userAtom);
	const [posts, setPosts] = useRecoilState(postsAtom);
	const navigate = useNavigate();

	useEffect(() => {
		const getUser = async () => {
			try {
				const res = await fetch("/api/users/profile/" + postedBy);
				const data: UserType & { success?: string | boolean, error?: string } = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
				setUser(data);
			} catch (error: any) {
				showToast("Error", error.message, "error");
				setUser(null);
			}
		};

		getUser();
	}, [postedBy, showToast]);

	if (!currentUser)
		currentUser = { isAdmin: false };

	const handleDeletePost = async (e: any) => {
		try {
			e.preventDefault();
			if (!window.confirm("Are you sure you want to delete this post?")) return;

			const res = await fetch(`/api/posts/${post._id}`, {
				method: "DELETE",
			});
			const data: { success?: string | boolean, error?: string } = await res.json();
			if (data.error) {
				showToast("Error", data.error, "error");
				return;
			}
			showToast("Success", "Post deleted", "success");
			setPosts(posts.filter((p) => p._id !== post._id));
		} catch (error: any) {
			showToast("Error", error.message, "error");
		}
	};

	if (!user) return null;
	return (

		<Flex gap={3} mb={4} py={5}>
			<Link to={`/user/${user.username}/post/${post._id}`}>
				<Flex flexDirection={"column"} alignItems={"center"}>
					<Avatar
						size='md'
						name={user.name}
						src={user?.profilePic}
						onClick={(e) => {
							e.preventDefault();
							navigate(`/user/${user.username}`);
						}}
					/>
					<Box w='1px' h={"70px"} bg='gray.light' my={2}></Box>
					<Box position={"relative"} w={"full"}>
						{post.replies.length === 0 && <Text textAlign={"center"}>🥱</Text>}
						{post.replies[0] && (
							<Avatar
								size='xs'
								name={post.replies[0].name}
								src={post.replies[0].userProfilePic}
								position={"absolute"}
								top={"0px"}
								left='15px'
								padding={"2px"}
							/>
						)}

						{post.replies[1] && (
							<Avatar
								size='xs'
								name={post.replies[1].name}
								src={post.replies[1].userProfilePic}
								position={"absolute"}
								bottom={"0px"}
								right='-5px'
								padding={"2px"}
							/>
						)}

						{post.replies[2] && (
							<Avatar
								size='xs'
								name={post.replies[2].name}
								src={post.replies[2].userProfilePic}
								position={"absolute"}
								bottom={"0px"}
								left='4px'
								padding={"2px"}
							/>
						)}
					</Box>
				</Flex>
			</Link>
			<Flex flex={1} flexDirection={"column"} gap={1}>
				<Link to={`/user/${user.username}/post/${post._id}`}>
					<Flex justifyContent={"space-between"} w={"full"}>
						<Stack w={"full"} alignItems={"left"} spacing={0}>
							<Text fontSize='sm' fontWeight='bold'>
								{user?.name}
							</Text>
							<Text fontWeight='400' display={"flex"} alignItems={"center"} color={useColorModeValue("black", "gray.400")}>
								{`(`}@{user?.username}{`)`}
							</Text>
						</Stack>
						<Flex gap={4} alignItems={"center"}>
							<Text fontSize={"xs"} width={36} textAlign={"right"} color={"gray.light"}>
								{formatDistanceToNow(new Date(post.createdAt))} ago
							</Text>
							{/* @ts-expect-error */}
							{((currentUser?._id === user._id || (currentUser.isAdmin && !user.isAdmin))) && <DeleteIcon size={20} onClick={handleDeletePost} />}
						</Flex>
					</Flex>
				</Link>
				<Linkify
					componentDecorator={(decoratedHref, decoratedText, key) => (
						<a target="blank" href={decoratedHref} key={key}>
							{decoratedText}
						</a>
					)}
				>
					<Text fontSize={"sm"}>{post.text}</Text>
				</Linkify>
				<Link to={`/user/${user.username}/post/${post._id}`}>
					{post.img && (
						<Box overflow={"hidden"}>
							<Image borderRadius={6} border={"1px solid"} borderColor={"gray.light"} src={post.img} w={"auto"} h={"auto"} maxH={520} maxW={520} />
						</Box>
					)}

					<Flex gap={3} my={1}>
						<Actions post={post} />
					</Flex>
				</Link>
			</Flex>
		</Flex>

	);
};

export default Post;
