import { Box, Container } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import DownloadApp from "./pages/DownloadApp";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
import {useEffect, useCallback} from 'react'
import UpdateProfilePage from "./pages/UpdateProfilePage";
import CreatePost from "./components/CreatePost";
import ChatPage from "./pages/ChatPage";
import Shortcuts from "./pages/Shortcuts"
import { SettingsPage } from "./pages/SettingsPage";
function App() {
	const navigate = useNavigate()
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
	  }, []);
	
	  useEffect(() => {
		// attach the event listener
		document.addEventListener('keydown', handleKeyPress);
	
		// remove the event listener
		return () => {
		  document.removeEventListener('keydown', handleKeyPress);
		};
	  }, [handleKeyPress]);
	const user = useRecoilValue(userAtom);
	const { pathname } = useLocation();
	return (
		<>
		<Header />
		<Box position={"relative"} w='full'
		mt="0rem"
      p="4.5rem"
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
					<Route path='/settings' element={user ? <SettingsPage /> : <Navigate to={"/auth"} />} />
					<Route path='/download' element={<DownloadApp />} />
				</Routes>
			</Container>
		</Box>
		</>
	);
}

export default App;
