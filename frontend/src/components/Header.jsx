import { Button, Center, Flex, Image, Link, useColorMode, useColorModeValue, Box, Avatar } from "@chakra-ui/react";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";

import { Portal } from "@chakra-ui/portal";
import { Link as RouterLink } from "react-router-dom";
import { useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import { BsFillChatQuoteFill } from "react-icons/bs";

const Header = () => {
	const userAgent = navigator.userAgent;
	const shouldRenderComponent = !userAgent.includes('Electron') && !userAgent.includes('Mobile');
	const shouldRenderShortcuts = !userAgent.includes('Mobile')
	const { colorMode, toggleColorMode } = useColorMode();
	const user = useRecoilValue(userAtom);
	const logout = useLogout();
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
		<>

			<Flex justifyContent={"center"} mt={0} mb='9' gap={6}

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
						<Flex alignItems={"center"} gap={9} paddingBottom="1rem">
							<Link as={RouterLink} to={`/chat`} style={{ webkitAppRegion: 'no-drag' }}>
								<BsFillChatQuoteFill size={28} />
							</Link>
							{user && (
								<Link as={RouterLink} to='/'>
									<Image
										cursor={"pointer"}
										alt='logo'
										marginTop={2}
										w={15}
										h={15}
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
														<MenuItem bg={"gray.dark"} color={"white"} closeOnSelect={true} onClick={() => { onClose(); useEffect(navigate(`/user/${user.username}`)) }}>
															Your Profile
														</MenuItem>
														{shouldRenderComponent &&
															(<MenuItem bg={"gray.dark"} color={"white"} closeOnSelect={true} onClick={() => { onClose(); useEffect(navigate("/download")) }}>
																Get Desktop App
															</MenuItem>)}
														{shouldRenderShortcuts &&
															(<MenuItem bg={"gray.dark"} color={"white"} closeOnSelect={true} onClick={() => { onClose(); useEffect(navigate("/shortcuts")) }}>
																Keyboard Shortcuts
															</MenuItem>)}
														<MenuItem bg={"gray.dark"} color={"white"} closeOnSelect={true} onClick={() => { onClose(); useEffect(navigate("/settings")) }}>
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
			</Flex>
			{shouldRenderComponent && (
				<Flex justifyContent={"right"} mt={0}

					position="fixed" zIndex={1}
					right={0}
					paddingRight="1.5rem"
					paddingTop="1rem"
				>
					<Button onClick={() => { navigate("/download") }}>What is the point?</Button>
				</Flex>
			)}
		</>
	);
};

export default Header;
