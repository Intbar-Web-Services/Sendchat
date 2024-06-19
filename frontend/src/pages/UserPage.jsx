import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { Link, useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import Post from "../components/Post";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import repliesAtom from "../atoms/repliesAtom";
import { useSocket } from "../context/SocketContext.jsx";
import messageSound from "../assets/sounds/message.mp3";
import Comment from "../components/Comment";
import { BsBoxArrowUpRight } from "react-icons/bs";

const UserPage = () => {
	const { user, loading } = useGetUserProfile();
	const { username } = useParams();
	const showToast = useShowToast();
	const [posts, setPosts] = useRecoilState(postsAtom);
	const [replies, setReplies] = useRecoilState(repliesAtom);
	const [fetchingPosts, setFetchingPosts] = useState(true);
	const [fetchingReplies, setFetchingReplies] = useState(true);

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
		const getPosts = async () => {
			if (!user) return;
			setFetchingPosts(true);
			try {
				const res = await fetch(`/api/posts/user/${username}`);
				const data = await res.json();
				setPosts(data);
			} catch (error) {
				showToast("Error", error.message, "error");
				setPosts([]);
			} finally {
				setFetchingPosts(false);
			}
		};

		getPosts();
	}, [username, showToast, setPosts, user]);

	useEffect(() => {
		const getReplies = async () => {
			if (!user) return;
			setFetchingReplies(true);
			try {
				const res = await fetch(`/api/posts`);
				const data = await res.json();
				setReplies(data);
			} catch (error) {
				showToast("Error", error.message, "error");
				setReplies([]);
			} finally {
				setFetchingReplies(false);
			}
		};

		getReplies();
	}, [username, showToast, setReplies, user]);

	if (!user && loading) {
		return (
			<Flex justifyContent={"center"}>
				<Spinner size={"xl"} />
			</Flex>
		);
	}

	if (!user && !loading) return <h1>We can't find this user. Press the home button to see recent posts.</h1>;

	return (
		<>
			<UserHeader user={user} />
			{user._id !== "6672b78eab0404a06146d47c" && (
				<Tabs isFitted>
					<TabList>
						<Tab>Posts</Tab>
						<Tab>Replies</Tab>
						<Tab>Likes</Tab>
					</TabList>

					<TabPanels>
						<TabPanel>
							{!fetchingPosts && posts.length === 0 && <h1>There's no posts here yet.</h1>}
							{fetchingPosts && (
								<Flex justifyContent={"center"} my={12}>
									<Spinner size={"xl"} />
								</Flex>
							)}

							{posts.map((post) => (
								<Post key={post._id} post={post} postedBy={post.postedBy} />
							))}
						</TabPanel>

						<TabPanel>
							{!fetchingReplies && replies.length === 0 && <h1>This person has never replied.</h1>}
							{fetchingReplies && (
								<Flex justifyContent={"center"} my={12}>
									<Spinner size={"xl"} />
								</Flex>
							)}

							{replies.slice(0).reverse().map((postReply) => (postReply.replies.slice(0).reverse().map((reply) => (
								(reply.userId == user._id &&
									(
										<>
											<Link to={`/user/${postReply.postedBy}/post/${postReply._id}`}>
												<Flex marginTop={3}>
													<Text marginRight={2} marginTop={0}>
														Go to post
													</Text>
													<BsBoxArrowUpRight marginTop={2} />
												</Flex>
											</Link>

											<Comment
												key={reply._id}
												reply={reply}
												lastReply={reply._id === postReply.replies[postReply.replies.length - 1]._id}
											/>
										</>))
							))))}
						</TabPanel>

						<TabPanel>
							{!fetchingReplies && replies.length === 0 && <h1>This person has never liked anything.</h1>}
							{fetchingReplies && (
								<Flex justifyContent={"center"} my={12}>
									<Spinner size={"xl"} />
								</Flex>
							)}

							{replies.slice(0).reverse().map((postReply) => (postReply.likes.map((userId) => (
								(userId == user._id &&
									(
										<>
											<Post key={postReply._id} post={postReply} postedBy={postReply.postedBy} />
										</>))
							))))}
						</TabPanel>
					</TabPanels>
				</Tabs>
			)}
		</>
	);
};

export default UserPage;
