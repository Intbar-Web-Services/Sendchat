import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { Portal } from "@chakra-ui/portal";
import { Button, useToast, useColorMode, useColorModeValue, Select } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { CgMoreO, CgArrowDown, CgArrowUp } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";
import ModerationMenu from "../components/ModerationMenu";
import { conversationsAtom, selectedConversationAtom, newConversationAtom } from "../atoms/messagesAtom";
import Linkify from "react-linkify";

const UserHeader = ({ user: givenUser }) => {
	let [user, setUser] = useState(givenUser);
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
	const [followingNames, setFollowingNames] = useState([]);
	const isModerator = currentUser.isAdmin;
	const [showModerationMenu, setShowModerationMenu] = useState(false);
	const handleModeration = () => {
		setShowModerationMenu(true);
	};

	useEffect(() => {
		setUser(givenUser);
	}, [givenUser]);

	const handleUnWarn = async () => {
		const res = await fetch(`/api/punishments/unwarn/${user._id}`);
		if (res.error) return showToast("Error", res.error, "error");
		let editedUser = structuredClone(givenUser);
		editedUser.punishment.type = "none";
		setUser(editedUser);

		showToast("Success", "User successfuly unwarned", "success");
	};

	useEffect(() => {
		async function fetchFollowerData() {
			const names = [];

			for (let i = 0; i < ((user.followers.length > 5) ? 5 : user.followers.length); i++) {
				try {
					const response = await fetch(`/api/users/profile/${user.followers[i]}`);
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

	useEffect(() => {
		async function fetchFollowingData() {
			const names = [];

			for (let i = 0; i < ((user.following.length > 5) ? 5 : user.following.length); i++) {
				try {
					const response = await fetch(`/api/users/profile/${user.following[i]}`);
					const userData = await response.json();
					const userName = userData.username;
					if (userName) {
						names.push(userName);
					}
				} catch (error) {
					showToast('Error', 'There was an issue getting this persons following..', 'error');
				}
			}

			setFollowingNames(names);
		}

		fetchFollowingData();
	}, [user.following]);

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
						{user.isAdmin &&
							(<Text fontSize={"xs"} bg={useColorModeValue("gray.300", "gray.dark")} color={"gray.light"} p={1} borderRadius={"full"}>
								Admin
							</Text>)
						}
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
			{(currentUser?._id !== user._id && user._id !== "6670f6d092d28380a1932445") && (
				<Flex gap={3}>
					<Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating}>
						{following ? "Unfollow" : "Follow"}
					</Button>
					<Button size={"sm"} onClick={handleConversationSearch}>Chat</Button>
				</Flex>
			)}
			<Flex w={"full"} justifyContent={"space-between"}>
				<Flex gap={0.2} alignItems={"center"}>
					{user._id !== "6670f6d092d28380a1932445" && (
						<Text color={"gray.light"}>{user.followers.length} followers</Text>
					)}
					{(!user.followers.length == 0 && user._id !== "6670f6d092d28380a1932445") && (
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
					{user._id !== "6670f6d092d28380a1932445" && (
						<Text color={"gray.light"} marginLeft={2.5}>{user.following.length} following</Text>
					)}
					{(!user.following.length == 0 && user._id !== "6670f6d092d28380a1932445") && (
						<Box className='icon-container' paddingTop="0.5rem">
							<Menu>
								<MenuButton>
									<CgArrowUp size={24} cursor={"pointer"} />
								</MenuButton>
								<Portal>
									<MenuList bg={"gray.dark"}>
										{followingNames.slice(0, 6).map((name, index) => (
											<MenuItem key={index} bg={"gray.dark"} color={"white"} onClick={() => navigate(`/user/${name}`)}>@{name}</MenuItem>
										))}
									</MenuList>
								</Portal>
							</Menu>
						</Box>
					)}
				</Flex>
				<Flex>
					{user._id !== "6670f6d092d28380a1932445" && (
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
										{(isModerator && user._id != currentUser._id && !user.isAdmin && user.punishment.type == "none" && user._id !== "6670f6d092d28380a1932445") && (
											<MenuItem bg={"gray.dark"} color={"white"} onClick={handleModeration}>
												Moderate
											</MenuItem>
										)}
										{(user.punishment.type == "warn") && (
											<MenuItem bg={"gray.dark"} color={"white"} onClick={handleUnWarn}>
												Unwarn
											</MenuItem>
										)}
									</MenuList>
								</Portal>
							</Menu>
						</Box>
					)}
				</Flex>
			</Flex>
			<ModerationMenu id={user._id} isOpen={showModerationMenu} onClose={async () => {
				setShowModerationMenu(false);
				const res = await fetch(`/api/users/profile/${user._id}`);
				const data = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
				if (data.isFrozen) {
					setUser(null);
					return;
				}
				setUser(data);
			}} />
		</VStack>
	);
};

export default UserHeader;
