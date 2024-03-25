import { Button, Center, Flex, Image, Link, useColorMode, Box, Avatar } from "@chakra-ui/react";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";

import { Portal } from "@chakra-ui/portal";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { useEffect, useCallback } from 'react'
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";

const Header = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const user = useRecoilValue(userAtom);
	const logout = useLogout();
	const setAuthScreen = useSetRecoilState(authScreenAtom);
	const navigate = useNavigate()
	console.log(user)
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
		
		<Flex justifyContent={"center"} mt={6} mb='3' gap={6}>
			{!user && (
				<Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("login")}>
					Login
				</Link>
			)}


			{user && (
				<>
					<Flex alignItems={"center"} gap={9}>
												<Link as={RouterLink} to={`/chat`}>
													<BsFillChatQuoteFill size={28} />
												</Link>
										{user && (
											<Link as={RouterLink} to='/'>
												<Image
													cursor={"pointer"}
													alt='logo'
													w={12}
													h={12}
													src={colorMode === "dark" ? "/favicon.png" : "/favicon.png"}
												/>
											</Link>
										)}
						<Flex>
							<Box className='icon-container'>
								<Menu>
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
											<MenuItem bg={"gray.dark"} color={"white"} closeOnSelect={true} onClick={() => {onClose(); useEffect(navigate(`/user/${user.username}`))}}>
												Your Profile
											</MenuItem>
											<MenuItem bg={"gray.dark"} color={"white"} closeOnSelect={true} onClick={() => {onClose(); useEffect(navigate("/shortcuts"))}}>
												Keyboard Shortcuts
											</MenuItem>
											<MenuItem bg={"gray.dark"} color={"white"} closeOnSelect={true} onClick={() => {onClose(); useEffect(navigate("/download"))}}>
												Download App
											</MenuItem>
											<MenuItem bg={"gray.dark"} color={"white"} closeOnSelect={true} onClick={() => {onClose(); useEffect(navigate("/settings"))}}>
												Settings
											</MenuItem>
											<MenuItem bg={"gray.dark"} color={"red"} onClick={() => {logout(); navigate("/")}} closeOnSelect={true}>
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
				<Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("signup")}>
					Sign up
				</Link>
			)}
		</Flex>
	);
};

export default Header;
