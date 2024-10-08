import { SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Input, Skeleton, SkeletonCircle, Text, useColorModeValue } from "@chakra-ui/react";
import Conversation from "../components/Conversation";
import { GiConversation } from "react-icons/gi";
import MessageContainer from "../components/MessageContainer";
import { FormEvent, useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import { conversationsAtom, selectedConversationAtom, newConversationAtom } from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";
import { messaging } from "../firebase";
import getCurrentUserId from "../user.js";
import { onMessage } from "firebase/messaging";
import { useNavigate } from "react-router-dom";
import ConversationType from "../contracts/conversation.js";
import UserType from "../contracts/user.js";

const ChatPage = () => {
	const [searchingUser, setSearchingUser] = useState(false);
	const urlParams = new URLSearchParams(window.location.search);
	const [loadingConversations, setLoadingConversations] = useState(true);
	const [searchText, setSearchText] = useState("");
	const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
	const [conversations, setConversations] = useRecoilState(conversationsAtom);
	const [newConversation, setNewConversation] = useRecoilState(newConversationAtom);
	const currentUser = useRecoilValue(userAtom);
	const showToast = useShowToast();
	const { socket, onlineUsers } = useSocket() as any;
	const navigate = useNavigate();

	useEffect(() => {
		socket?.on("messagesSeen", ({ conversationId }: { conversationId: string }) => {
			setConversations((prev) => {
				const updatedConversations = prev.map((conversation) => {
					if (conversation._id === conversationId) {
						return {
							...conversation,
							lastMessage: {
								...conversation.lastMessage,
								seen: true,
							},
						};
					}
					return conversation;
				});
				return updatedConversations;
			});
		});
	}, [socket, setConversations]);

	useEffect(() => {
		const getConversations = async () => {
			try {
				const res = await fetch("/api/messages/conversations", {
					headers: {
						"authorization": `Bearer ${await getCurrentUserId()}`,
					}
				});
				const data: ConversationType[] & { success?: string | boolean, error?: string } = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
				setConversations(data);
			} catch (error: any) {
				showToast("Error", error.message, "error");
			} finally {
				setLoadingConversations(false);
			}
		};

		getConversations();
	}, [showToast, setConversations]);

	useEffect(() => {
		if (urlParams.get('conversation')) {
			setSearchText(urlParams.get('conversation') as string);
			handleConversationSearch(null);
		}
	}, [loadingConversations, urlParams]);

	const getSelectedUser = () => {
		return selectedConversation;
	};

	useEffect(() => {
		if ('Notification' in window && Notification.permission == "granted") {
			onMessage(messaging, async (payload) => {
				if (payload.data!.isImage == "true") {
					payload.data!.body = "Sent an image";
				}
				const notificationOptions = {
					body: payload.data!.body,
					icon: payload.data!.image,
				};

				if (location.pathname === "/chat" && getSelectedUser()._id !== payload.data!.conversationId) {
					new Notification(payload.data!.title, notificationOptions).onclick = () => {
						navigate(`/chat?conversation=${payload.data!.username}`);
					};
				}
			});
		}
	}, [getSelectedUser, navigate]);

	const handleConversationSearch = async (e: FormEvent | null) => {
		if (e) {
			e.preventDefault();
		}
		if (loadingConversations)
			return;
		setSearchingUser(true);
		try {
			const res = await fetch(`/api/users/profile/${searchText}`, {
				headers: {
					"authorization": `Bearer ${await getCurrentUserId()}`,
				}
			});
			const searchedUser: UserType = await res.json();
			if (searchedUser.error || searchedUser._id === "6682364096e6b50e23f0b9d6") {
				showToast("Error", "Nobody matches this username, check for any typos", "error");
				return;
			}

			const messagingYourself = searchedUser._id === currentUser!._id;
			if (messagingYourself) {
				showToast("Error", "You cannot chat with yourself", "error");
				return;
			}

			const conversationAlreadyExists = conversations.find(
				(conversation) => conversation.participants[0]._id === searchedUser._id
			);

			if (conversationAlreadyExists) {
				setSelectedConversation({
					_id: conversationAlreadyExists._id,
					userId: searchedUser._id as string,
					username: searchedUser.username as string,
					name: searchedUser.name,
					userProfilePic: searchedUser.profilePic as string
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
						_id: searchedUser._id as string,
						username: searchedUser.username as string,
						name: searchedUser.name as string,
						profilePic: searchedUser.profilePic as string
					},
				],
			})

			setConversations((prevConvs) => [...prevConvs, newConversation]);
			setSelectedConversation({
				_id: newConversation._id,
				userId: searchedUser._id as string,
				username: searchedUser.username as string,
				name: searchedUser.name,
				userProfilePic: searchedUser.profilePic as string,
				mock: true,
			});
		} catch (error: any) {
			showToast("Error", error.message, "error");
		} finally {
			setSearchingUser(false);
			window.history.pushState("", "", window.location.pathname);
		}
	};

	return (
		<Box
			position={"absolute"}
			left={"50%"}
			w={{ base: "100%", md: "80%", lg: "750px" }}
			p={4}
			transform={"translateX(-50%)"}
		>
			<Flex
				gap={4}
				flexDirection={{ base: "column", md: "row" }}
				maxW={{
					sm: "400px",
					md: "full",
				}}
				mx={"auto"}
			>
				<Flex flex={30} gap={2} flexDirection={"column"} maxW={{ sm: "250px", md: "full" }} mx={"auto"}>
					<Text fontWeight={700} color={useColorModeValue("gray.600", "gray.400")}>
						Your Sendchats
					</Text>
					<form onSubmit={handleConversationSearch}>
						<Flex alignItems={"center"} gap={2}>

							<Flex justify="center" gap={1}>
								<Text paddingTop={1} fontWeight='500' fontSize={'19'}>@</Text>
								<Input placeholder="Start a chat" onChange={(e) => setSearchText(e.target.value)} />
							</Flex>
							<Button size={"sm"} onClick={handleConversationSearch} isLoading={searchingUser}>
								<SearchIcon />
							</Button>

						</Flex>
					</form>

					{loadingConversations &&
						[0, 1, 2, 3, 4].map((_, i) => (
							<Flex cursor="progress" key={i} gap={4} alignItems={"center"} p={"1"} borderRadius={"md"}>
								<Box>
									<SkeletonCircle size={"10"} />
								</Box>
								<Flex w={"full"} flexDirection={"column"} gap={3}>
									<Skeleton h={"10px"} w={"80px"} />
									<Skeleton h={"8px"} w={"90%"} />
								</Flex>
							</Flex>
						))}

					{!loadingConversations &&
						conversations.map((conversation) => (
							<Conversation
								key={conversation._id}
								isOnline={onlineUsers.includes(conversation.participants[0]._id)}
								conversation={conversation}
							/>
						))}
				</Flex>
				{!selectedConversation._id && (
					<Flex
						flex={70}
						borderRadius={"md"}
						p={2}
						flexDir={"column"}
						alignItems={"center"}
						justifyContent={"center"}
						height={"400px"}
					>
						<GiConversation size={100} />
						<Text fontSize={20}>Select someone to start chatting!</Text>
						{/* eslint-disable-next-line react-hooks/rules-of-hooks */}
						<Text fontSize={14} fontWeight={15} color={useColorModeValue("gray", "gray.300")}>To start a new Sendchat,</Text>
						{/* eslint-disable-next-line react-hooks/rules-of-hooks */}
						<Text fontSize={14} fontWeight={15} color={useColorModeValue("gray", "gray.300")}>Type a username in the search box.</Text>
					</Flex>
				)}

				{selectedConversation._id && <MessageContainer />}
			</Flex>
		</Box>
	);
};

export default ChatPage;