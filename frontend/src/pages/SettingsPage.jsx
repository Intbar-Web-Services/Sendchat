import { Button, Divider, Flex, Text, position } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import useLogout from "../hooks/useLogout";
import { useNavigate, Link } from "react-router-dom";
import { useColorMode, useColorModeValue } from "@chakra-ui/react";
import { useEffect } from "react";

export const SettingsPage = () => {
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

	return (
		<>
			<Text my={1} fontWeight={"bold"}>
				Theme
			</Text>
			<Button size={"sm"} colorScheme='yellow' onClick={toggleColorMode}>
				Switch to {currentColorMode} mode
			</Button>
			<Divider />
			<Text my={1} fontWeight={"bold"}>
				Log Out
			</Text>
			<Text my={1}>Log out of your IWS account by clicking below or pressing Alt + L</Text>
			<Button size={"sm"} colorScheme='red' onClick={logout}>
				Log Out
			</Button>
			<Divider />
			<Text my={1} fontWeight={"bold"}>
				Freeze Your Account
			</Text>
			<Text my={1}>Freezing your IWS account pauses incoming Sendchat messages. You can unfreeze your IWS account anytime by logging back in.</Text>
			<Button size={"sm"} colorScheme='red' onClick={freezeAccount}>
				Freeze
			</Button>
			<Divider />

			<Flex _hover={{
				cursor: "pointer",
				bg: useColorModeValue("gray.9000", "gray.dark"),
				color: "white",
			}}>
				<Link to={"/shortcuts"}>
					<Text my={1}>Use Sendchat faster with Keyboard Shortcuts!</Text>
				</Link>
			</Flex>
		</>
	);
};
