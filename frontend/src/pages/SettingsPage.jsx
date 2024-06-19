import { Button, Divider, Flex, Text, position, useColorMode, useColorModeValue } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import useLogout from "../hooks/useLogout";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";

export const SettingsPage = () => {
	const userAgent = navigator.userAgent;
	const currentUser = useRecoilValue(userAtom);
	const setCurrentUser = useSetRecoilState(userAtom);
	let versionType = "";
	if (userAgent.includes('Web') || userAgent.includes('Firefox')) {
		versionType = "Sendchat for Web";
	} else if (userAgent.includes('Mobile')) {
		versionType = "Sendchat Web for Mobile";
	} else if (userAgent.includes('Electron')) {
		versionType = "Sendchat Desktop (Electron)";
	} else {
		versionType = "an unknown device or browser";
	}
	const showToast = useShowToast();
	const logout = useLogout();
	const navigate = useNavigate();
	var currentColorMode = ""
	const { colorMode, toggleColorMode } = useColorMode();
	if (colorMode === "light") { currentColorMode = "dark" }
	if (colorMode === "dark") { currentColorMode = "light" }
	const freezeAccount = async () => {
		if (!window.confirm("Are you sure you want to freeze your IWS account? This will disable access to ALL IWS services.")) return;

		try {
			const res = await fetch("/api/users/freeze", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
			});
			const data = await res.json();

			if (data.error) {
				return showToast("Error", data.error, "error");
			}
			if (data.success) {
				await logout();
				showToast("Success", "Your IWS account has been frozen", "success");
			}
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	const demote = async () => {
		if (!window.confirm("Are you sure you want to remove admin priveleges for your account?")) return;

		try {
			const res = await fetch("/api/punishments/demoteself");
			const data = await res.json();

			if (data.error) {
				return showToast("Error", data.error, "error");
			}

			localStorage.setItem("user-threads", JSON.stringify(data));
			setCurrentUser(JSON.parse(localStorage.getItem("user-threads")));
			showToast("Success", "Your admin priveleges have been removed", "success");
			navigate(`/`);
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return (
		<>
			<Text my={1} fontWeight={"bold"}>
				Theme
			</Text>
			<Button size={"sm"} colorScheme='yellow' onClick={toggleColorMode}>
				Switch to {currentColorMode} mode
			</Button>
			<Divider my={4} />
			<Text my={1} fontWeight={"bold"}>
				Freeze Your Account
			</Text>
			<Text my={1}>Freezing your IWS account pauses incoming Sendchat messages. You can unfreeze your IWS account anytime by logging back in.</Text>
			<Button size={"sm"} colorScheme='red' onClick={freezeAccount}>
				Freeze
			</Button>
			{!userAgent.includes('Mobile') && (
				<>
					<Divider my={4} />

					<Flex
						flex='70'
						bg={useColorModeValue("gray.200", "gray.dark")}
						borderRadius={"md"}
						p={2}
						flexDirection={"column"}
					>
						<Link to={"/shortcuts"}>
							<Text my={1}>Use Sendchat faster with Keyboard Shortcuts!</Text>
						</Link>
					</Flex>
				</>)}
			{currentUser.isAdmin && (
				<>
					<Text my={1}>Remove your admin priveleges</Text>
					<Button size={"sm"} colorScheme='red' onClick={demote}>
						Remove
					</Button>
				</>
			)}
			<Text my={1} fontSize={12} color={useColorModeValue("gray.500", "gray.400")}>You're using {versionType}</Text>
		</>
	);
};
