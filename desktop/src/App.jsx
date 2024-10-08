import { Box, Button, Text, Center, useColorMode, Image, Container, Flex, Spinner } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import PunishmentPage from "./pages/PunishmentPage";
import useGetUserProfile from "./hooks/useGetUserProfile";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "./atoms/userAtom";
import { useEffect, useCallback } from 'react'
import UpdateProfilePage from "./pages/UpdateProfilePage";
import CreatePost from "./components/CreatePost";
import ChatPage from "./pages/ChatPage";
import Shortcuts from "./pages/Shortcuts"
import { SettingsPage } from "./pages/SettingsPage";
import { BsXCircleFill } from "react-icons/bs";

function App() {
	const setStoredUser = useSetRecoilState(userAtom);
	const colorMode = useColorMode();
	const navigate = useNavigate();
	const handleKeyPress = useCallback((event) => {
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
	const currentUser = useGetUserProfile(user ? { username: user._id } : { username: null });
	useEffect(() => {
		if (!currentUser.loading && currentUser.user) {
			if (currentUser.user.punishment.type != "") {
				setStoredUser(currentUser.user);
				localStorage.setItem("user-threads", JSON.stringify(currentUser.user));
			}
		}
	}, [currentUser.loading, currentUser.user, setStoredUser]);

	useEffect(() => {
		if (document.cookie == '') {
			if (localStorage.getItem("user-threads") != null) {
				localStorage.removeItem("user-threads");
				setStoredUser(null);
				location.reload();
			}
		}
	}, [setStoredUser])

	const { pathname } = useLocation();
	if (!currentUser.user && currentUser.loading) {
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
						onClick={() => location.reload()}
						mt={6}
					>Retry</Button>
				</Flex>
			</Flex>
		);
	}

	if (!user || currentUser.user) {
		return (
			<>
				{!user || (currentUser.user.punishment.type == "none" || user.punishment.type == "") ? (
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
								</Routes>
							</Container>
						</Box></>) : (
					<PunishmentPage user={currentUser.user} type={currentUser.user.punishment.type} reason={currentUser.user.punishment.reason} hours={currentUser.user.punishment.hours} />
				)}
			</>
		);
	}
}
export default App;
