import { Button, Center, Flex, Image, Link, useColorMode } from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import {useEffect, useCallback} from 'react'
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
	const handleKeyPress = useCallback((event) => {
		if (event.altKey && event.key === 'l') {
			logout()
		  }
		  if (event.altKey && event.key === 'u') {
			navigate(`/user/${user.username}`)
		  }
		  if (event.altKey && event.key === "m") {
			toggleColorMode();
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
		<Flex justifyContent={"center"} mt={6} mb='9' gap={8}>
			{user && (
				<Link as={RouterLink} to='/'>
					<Image
				cursor={"pointer"}
				alt='logo'
				w={16}
				h={16}
				src={colorMode === "dark" ? "/favicon.png" : "/favicon.png"}
			/>
				</Link>
			)}
			{!user && (
				<Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("login")}>
					Login
				</Link>
			)}

			

			{user && (
				<Flex alignItems={"center"} gap={8}>
					<Link as={RouterLink} to={`/user/${user.username}`}>
						<RxAvatar size={37} />
					</Link>
					<Link as={RouterLink} to={`/chat`}>
						<BsFillChatQuoteFill size={32} />
					</Link>
					<Link as={RouterLink} to={`/settings`}>
						<MdOutlineSettings size={32} />
					</Link>
				</Flex>
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
