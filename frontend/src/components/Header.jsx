import { Button, Flex, Image, Link, useColorMode, useColorModeValue, Box, Avatar } from "@chakra-ui/react";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { Portal } from "@chakra-ui/portal";
import { Link as RouterLink } from "react-router-dom";
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { BsBellFill } from "react-icons/bs";
import { messaging, generateToken } from "../firebase";
import { onMessage, getToken } from "firebase/messaging";
import useShowToast from "../hooks/useShowToast";
import getCurrentUserId from "../user.js";

const Header = () => {
	const userAgent = navigator.userAgent;
	const shouldRenderComponent = !userAgent.includes('Mobile');
	const shouldRenderShortcuts = !userAgent.includes('Mobile')
	const { colorMode, toggleColorMode } = useColorMode();
	const [notificationsLoading, setNotificationsLoading] = useState(false);
	const user = useRecoilValue(userAtom);
	const logout = useLogout();
	const showToast = useShowToast();
	const setAuthScreen = useSetRecoilState(authScreenAtom);
	const navigate = useNavigate()
	const handleKeyPress = useCallback((event) => {
		if (event.altKey && event.key === 'l') {
			logout()
		}
		if (event.altKey && event.key === 'u') {
			navigate(`/user/${user.username}`)
		}
		if (event.altKey && event.key === "m") {
			toggleColorMode()
		}
		if (event.altKey && event.key === "s") {
			navigate("/settings")
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [logout, navigate, toggleColorMode]);

	const [notificationsVisible, setNotificationsVisible] = useState(false);

	useEffect(() => {
		if (Notification.permission !== "granted") {
			setNotificationsVisible(true);
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

	async function setupNotifications() {
		setNotificationsLoading(true);
		await generateToken();
		onMessage(messaging, (payload) => {
			if (payload.data.isImage == "true" && payload.data.type == "chat") {
				payload.data.body = "Sent an image";
			}
			const notificationOptions = {
				body: payload.data.body,
				icon: payload.data.image,
			};

			if (location.pathname !== "/chat" && payload.data.type == "chat") {
				new Notification(payload.data.title, notificationOptions).onclick = () => {
					navigate(`/chat?conversation=${payload.data.username}`);
				};
			} else if (payload.data.type == "post") {
				new Notification(payload.data.title, notificationOptions).onclick = () => {
					navigate(`/user/${payload.data.username}/post/${payload.data.conversationId}`);
				};
			}
		});
		const token = await getToken(messaging, {
			vapidKey:
				"BCE__zmwje5W2p5m4q2lI9dG7YfLqO8k8FyvVjIlEYuE5yW2lhRg7hDuU2iJ-YGjGPetn2ML1TEvn44U0C4K33E",
		});

		const res = await fetch("/api/messages/subscribe", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"authorization": `Bearer ${await getCurrentUserId()}`,
			},
			body: JSON.stringify({
				token: token,
				oldToken: messaging.token,
			}),
		});

		const data = await res.json();

		if (data.error) {
			setNotificationsLoading(false);
			showToast("Error", data.error, "error");
			return;
		}
		setNotificationsVisible(false);
		setNotificationsLoading(false);
		showToast("Success", "Notifications enabled successfully!", "success");
	}

	return (
		<>

			<Flex
				justifyContent={"center"}
				mt={0}
				mb='9'
				gap={6}
				position="fixed" zIndex="1" left={0}
				right={0}
				backgroundColor={useColorModeValue("gray.100", "#101010")}
				paddingTop="1rem"
				style={{ webkitAppRegion: 'drag' }}
			>
				{!user && (
					<Flex alignItems={"center"} gap={9} paddingBottom="1.85rem">
						<Link paddingTop="0.7rem" as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("login")} style={{ webkitAppRegion: 'no-drag' }}>
							Login
						</Link>
					</Flex>
				)}


				{user && (
					<>
						<Flex alignItems={"center"} gap="1.9em" paddingBottom="0.6rem">
							<Link as={RouterLink} to={`/chat`} style={{ webkitAppRegion: 'no-drag' }}>
								<BsFillChatQuoteFill size={33} />
							</Link>
							{user && (
								<Link as={RouterLink} to='/'>
									<Image
										cursor={"pointer"}
										alt='logo'
										marginTop={0.4}
										w="4em"
										h="4em"
										src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
										style={{ webkitAppRegion: 'no-drag' }}
									/>
								</Link>
							)}
							<Flex>
								<Box className='icon-container' style={{ webkitAppRegion: 'no-drag' }}>
									<Menu style={{ webkitAppRegion: 'no-drag' }}>
										{({ onClose }) => (
											<>
												<MenuButton>
													<Avatar
														size={
															"s"
														}
														name={user.name}
														src={user.profilePic}
													/>
												</MenuButton>
												<Portal>
													<MenuList bg={"gray.dark"} closeOnSelect={"true"}>
														<MenuItem bg={"gray.dark"} color={"white"} closeOnSelect={true} onClick={() => { onClose(); navigate(`/user/${user.username}`) }}>
															Your Profile
														</MenuItem>
														{shouldRenderComponent &&
															(<MenuItem bg={"gray.dark"} color={"white"} closeOnSelect={true} onClick={() => { onClose(); navigate("/download") }}>
																Get Desktop App
															</MenuItem>)}
														{shouldRenderShortcuts &&
															(<MenuItem bg={"gray.dark"} color={"white"} closeOnSelect={true} onClick={() => { onClose(); navigate("/shortcuts") }}>
																Keyboard Shortcuts
															</MenuItem>)}
														<MenuItem bg={"gray.dark"} color={"white"} closeOnSelect={true} onClick={() => { onClose(); navigate("/settings") }}>
															Settings
														</MenuItem>
														<MenuItem bg={"gray.dark"} color={"red"} onClick={() => { logout(); navigate("/") }} closeOnSelect={true}>
															Log Out
														</MenuItem>
													</MenuList>
												</Portal>
											</>
										)}
									</Menu>
								</Box>
							</Flex>
						</Flex>
					</>
				)}

				{!user && (
					<Link paddingTop="0.7rem" as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("signup")} style={{ webkitAppRegion: 'no-drag' }}>
						Sign up
					</Link>
				)}

				<Flex
					justifyContent={"right"}
					mt={0}
					position="fixed" zIndex={1}
					right={0}
					paddingRight="1.5rem"
					paddingTop="1.9rem"
				>
					{notificationsVisible && (
						<Button
							marginRight={3}
							onClick={setupNotifications}
							isLoading={notificationsLoading}
						>
							<BsBellFill />
						</Button>
					)}
					<Button onClick={() => { navigate("/download") }}>Download Desktop App</Button>
				</Flex>
			</Flex >
		</>
	);
};

export default Header;
