import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { Portal } from "@chakra-ui/portal";
import { Button, useToast, useColorMode, useColorModeValue, Select } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { CgMoreO, CgArrowDown } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";
import { conversationsAtom, selectedConversationAtom, newConversationAtom } from "../atoms/messagesAtom";
import Linkify from "react-linkify";

const UserHeader = ({ user }) => {
	const toast = useToast();
	const currentUser = useRecoilValue(userAtom); // logged in user
	const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);
	const colorMode = useColorMode();
	const [searchingUser, setSearchingUser] = useState(false);
	const [loadingConversations, setLoadingConversations] = useState(true);
	const [searchText, setSearchText] = useState("");
	const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
	const [conversations, setConversations] = useRecoilState(conversationsAtom);
	const [newConversation, setNewConversation] = useRecoilState(newConversationAtom);
	const showToast = useShowToast();
	const navigate = useNavigate();
	const [followerNames, setFollowerNames] = useState([]);


	useEffect(() => {
		async function fetchFollowerData() {
			const names = [];

			for (const followerId of user.followers) {
				try {
					const response = await fetch(`/api/users/profile/${followerId}`);
					const userData = await response.json();
					const userName = userData.username;
					if (userName) {
						names.push(userName);
					}
				} catch (error) {
					showToast('Error', 'There was an issue getting this persons followers..', 'error');
				}
			}

			setFollowerNames(names);
		}

		fetchFollowerData();
	}, [user.followers]);

	const handleConversationSearch = async (e) => {
		e.preventDefault();
		navigate("/chat")

		setSearchingUser(true);
		try {
			const res = await fetch(`/api/users/profile/${user.username}`);
			const searchedUser = await res.json();
			if (searchedUser.error) {
				showToast("Error", "There was an issue starting a Sendchat with this user", "error");
				return;
			}

			const conversationAlreadyExists = conversations.find(
				(conversation) => conversation.participants[0]._id === searchedUser._id
			);

			if (conversationAlreadyExists) {
				setSelectedConversation({
					_id: conversationAlreadyExists._id,
					userId: searchedUser._id,
					username: searchedUser.username,
					name: searchedUser.name,
					userProfilePic: searchedUser.profilePic
				});
				return;
			}

			setNewConversation({
				mock: true,
				lastMessage: {
					text: "",
					sender: "",
				},
				_id: Date.now(),
				participants: [
					{
						_id: searchedUser._id,
						username: searchedUser.username,
						name: searchedUser.name,
						profilePic: searchedUser.profilePic
					},
				],
			})


			function timeout(delay) {
				return new Promise((resolve) => setTimeout(resolve, delay));
			}
			await timeout(2000);

			setConversations((prevConvs) => [...prevConvs, newConversation]);
			setSelectedConversation({
				_id: searchedUser._id,
				userId: searchedUser._id,
				username: searchedUser.username,
				name: searchedUser.name,
				userProfilePic: searchedUser.profilePic
			});
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setSearchingUser(false);
		}
	};

	const copyURL = () => {
		const currentURL = window.location.href;
		navigator.clipboard.writeText(currentURL).then(() => {
			toast({
				title: "Success.",
				status: "success",
				description: "Profile link copied.",
				duration: 3000,
				isClosable: true,
			});
		});
	};

	return (
		<VStack gap={4} alignItems={"start"}>
			<Flex justifyContent={"space-between"} w={"full"}>
				<Box>
					<Text fontSize={"2xl"} fontWeight={"bold"}>
						{user.name}
					</Text>
					<Flex gap={2} alignItems={"center"}>
						<Text fontSize={"sm"}>@{user.username}</Text>
						<Text fontSize={"xs"} bg={useColorModeValue("gray.300", "gray.dark")} color={"gray.light"} p={1} borderRadius={"full"}>
							Sendchat 2.0
						</Text>
					</Flex>
				</Box>
				<Box>
					{user.profilePic && (
						<Avatar
							name={user.name}
							src={user.profilePic}
							size={{
								base: "md",
								md: "xl",
							}}
						/>
					)}
					{!user.profilePic && (
						<Avatar
							name={user.name}
							src='https://bit.ly/broken-link'
							size={{
								base: "md",
								md: "xl",
							}}
						/>
					)}
				</Box>
			</Flex>
			<Linkify
				componentDecorator={(decoratedHref, decoratedText, key) => (
					<a target="blank" href={decoratedHref} key={key}>
						{decoratedText}
					</a>
				)}
			>
				<Text>{user.bio}</Text>
			</Linkify>

			{currentUser?._id === user._id && (
				<Link as={RouterLink} to='/update'>
					<Button size={"sm"}>Update Profile</Button>
				</Link>
			)}
			{currentUser?._id !== user._id && (
				<Flex gap={3}>
					<Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating}>
						{following ? "Unfollow" : "Follow"}
					</Button>
					<Button size={"sm"} onClick={handleConversationSearch}>Chat</Button>
				</Flex>
			)}
			<Flex w={"full"} justifyContent={"space-between"}>
				<Flex gap={0.2} alignItems={"center"}>
					<Text color={"gray.light"}>{user.followers.length} followers</Text>
					{!user.followers.length == 0 && (
						<Box className='icon-container' paddingTop="0.5rem">
							<Menu>
								<MenuButton>
									<CgArrowDown size={24} cursor={"pointer"} />
								</MenuButton>
								<Portal>
									<MenuList bg={"gray.dark"}>
										{followerNames.slice(0, 6).map((name, index) => (
											<MenuItem key={index} bg={"gray.dark"} color={"white"} onClick={() => navigate(`/user/${name}`)}>@{name}</MenuItem>
										))}
									</MenuList>
								</Portal>
							</Menu>
						</Box>
					)}
				</Flex>
				<Flex>
					<Box className='icon-container'>
						<Menu>
							<MenuButton>
								<CgMoreO size={24} cursor={"pointer"} />
							</MenuButton>
							<Portal>
								<MenuList bg={"gray.dark"}>
									<MenuItem bg={"gray.dark"} color={"white"} onClick={copyURL}>
										Copy link
									</MenuItem>
								</MenuList>
							</Portal>
						</Menu>
					</Box>
				</Flex>
			</Flex>
			<Flex w={"full"}>
				<Flex flex={1} borderBottom={"1.5px solid white"} justifyContent={"center"} pb='3' cursor={"pointer"}>
					<Text fontWeight={"bold"}> Posts</Text>
				</Flex>
				<Flex
					flex={1}
					borderBottom={"1px solid gray"}
					justifyContent={"center"}
					color={"gray.light"}
					pb='3'
					cursor={"pointer"}
				>
					<Text fontWeight={"bold"}> Replies</Text>
				</Flex>
			</Flex>
		</VStack>
	);
};

export default UserHeader;
