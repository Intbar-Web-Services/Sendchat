import { Box, Button, Text, Center, useColorMode, Image, Container, Flex, Spinner } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import PunishmentPage from "./pages/PunishmentPage";
import DownloadApp from "./pages/DownloadApp";
import ActivatePage from "./pages/ActivatePage";
import useGetUserProfile from "./hooks/useGetUserProfile";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "./atoms/userAtom";
import { useEffect, useCallback } from 'react'
import UpdateProfilePage from "./pages/UpdateProfilePage";
import CreatePost from "./components/CreatePost";
import ChatPage from "./pages/ChatPage";
import Shortcuts from "./pages/Shortcuts"
import { SettingsPage } from "./pages/SettingsPage";
import ProbePage from "./pages/ProbePage";
import { messaging } from "./firebase";
import { onMessage, getToken } from "firebase/messaging";
import { onAuthStateChanged } from "firebase/auth";
import useShowToast from "./hooks/useShowToast";
import { BsXCircleFill } from "react-icons/bs";
import getCurrentUserId from "./user";
import { auth } from "./firebase";
import UserType from "./contracts/user";

function App() {
	const setStoredUser = useSetRecoilState(userAtom);
	const { colorMode } = useColorMode();
	const navigate = useNavigate();
	const showToast = useShowToast();
	const location = useLocation();

	useEffect(() => {
		document.body.style.cursor = "";
	}, [location]);

	const handleKeyPress = useCallback((event: any) => {
		if (event.altKey && event.key === 'c') {
			navigate("/chat")
		}
		if (event.altKey && event.key === 'h') {
			navigate("/");
		}
		if (event.altKey && event.key === 's') {
			navigate("/settings");
		}
		if (event.ctrlKey && event.key === ',') {
			navigate("/update");
		}
		if (event.ctrlKey && event.key === '/') {
			navigate("/shortcuts")
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
	const user = useRecoilValue(userAtom);
	const currentUser = useGetUserProfile(user ? { username: user._id } : { username: undefined });
	useEffect(() => {
		if (!currentUser.loading && currentUser.user) {
			if (!currentUser) return showToast("Error", "Can't get user information.", "error");
			getCurrentUserId().then((value) => {
				if (currentUser.user!.punishment!.type != "" && !value) {
					setStoredUser(currentUser.user as UserType);
					localStorage.setItem("user-threads", JSON.stringify(currentUser.user));
				}
			});
		}

		if ('Notification' in window && Notification.permission == "granted") {
			getToken(messaging, {
				vapidKey:
					"BCE__zmwje5W2p5m4q2lI9dG7YfLqO8k8FyvVjIlEYuE5yW2lhRg7hDuU2iJ-YGjGPetn2ML1TEvn44U0C4K33E",
			});

			onMessage(messaging, async (payload) => {
				if (payload.data!.isImage == "true") {
					payload.data!.body = "Sent an image";
				}
				const notificationOptions = {
					body: payload.data!.body,
					icon: payload.data!.image,
				};

				if (location.pathname !== "/chat" && payload.data!.type == "chat") {
					new Notification(payload.data!.title, notificationOptions).onclick = () => {
						navigate(`/chat?conversation=${payload.data!.username}`);
					};
				} else if (payload.data!.type == "post") {
					new Notification(payload.data!.title, notificationOptions).onclick = () => {
						navigate(`/user/${payload.data!.username}/post/${payload.data!.conversationId}`);
					};
				}
			});
		}
	}, [currentUser, navigate, setStoredUser, showToast]);


	useEffect(() => {
		function getCurrentUser() {
			return new Promise((resolve) => {
				onAuthStateChanged(auth, async (user) => {
					if (user) {
						resolve(user);
					} else {
						resolve(null);
					}
				});
			});
		}

		async function Run() {
			if (!await getCurrentUser()) {
				if (localStorage.getItem("user-threads") != null) {
					localStorage.removeItem("user-threads");
					setStoredUser(null);
					window.location.reload();
				}
			}
		}
		Run();
	}, [setStoredUser])

	const { pathname } = useLocation();
	if (!currentUser.user && currentUser.loading) {
		return (
			<Flex
				direction="column"
				cursor="wait"
			>
				<Flex
					justify="center"
					align="center"
					direction="column"
				>
					<Center h="72">
						<Image
							alt='logo'
							alignSelf="center"
							align="center"
							w="8em"
							h="8em"
							src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
							// @ts-ignore
							webkitAppRegion="no-drag"
						/>
					</Center>
					<Center>
						<Spinner size="xl" mt={105} />
					</Center>
				</Flex>
			</Flex>
		);
	}

	if (!currentUser.user) {
		return (
			<Flex
				direction="column"
			>
				<Flex
					justify="center"
					align="center"
					direction="column"
				>
					<Center h="72">
						<Image
							alt='logo'
							alignSelf="center"
							align="center"
							w="8em"
							h="8em"
							src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
							// @ts-ignore
							webkitAppRegion="no-drag"
						/>
					</Center>
					<Center>
						<BsXCircleFill color="red" size={52} />
					</Center>
					<Center mt={25}>
						<Text>Error: Cannot connect to server</Text>
					</Center>
					<Button
						onClick={() => window.location.reload()}
						mt={6}
					>
						Retry
					</Button>
				</Flex>
			</Flex>
		);
	}

	if (!user || currentUser.user) {
		return (
			<>
				{!user || (currentUser.user.punishment?.type == "none" || user.punishment?.type == "") ? (
					<>
						<Header />
						<Box position={"relative"} w='full'
							mt="0rem"
							p="6rem"
						>
							<Container maxW={pathname === "/" ? { base: "620px", md: "900px" } : "620px"}>

								<Routes>
									<Route path='/' element={user ? (<><HomePage /><CreatePost /></>) : (<Navigate to='/auth' />)} />
									<Route path='/auth' element={!user ? <AuthPage /> : <Navigate to='/' />} />
									<Route path='/update' element={user ? <UpdateProfilePage /> : <Navigate to='/auth' />} />

									<Route
										path='/user/:username'
										element={
											user ? (
												<>
													<UserPage />
													<CreatePost />
												</>
											) : (
												<UserPage />
											)
										}
									/>
									<Route path='/user/:username/post/:pid' element={<PostPage />} />
									<Route path='/chat' element={user ? <ChatPage /> : <Navigate to={"/auth"} />} />
									<Route path='/shortcuts' element={<Shortcuts />} />
									<Route path='/settings' element={user ? <SettingsPage /> : <	Navigate to={"/auth"} />} />
									<Route path='/download' element={<DownloadApp />} />
									<Route path="/probe" element={<ProbePage />} />
									<Route path="/activate" element={(user && !currentUser.user.isAdmin) ? <ActivatePage /> : <Navigate to='/' />} />
								</Routes>
							</Container>
						</Box></>) : (
					<PunishmentPage user={currentUser.user} type={currentUser.user.punishment?.type} reason={currentUser.user.punishment?.reason} hours={currentUser.user.punishment?.hours} />
				)}
			</>
		);
	}
}
export default App;
