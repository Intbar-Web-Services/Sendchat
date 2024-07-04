import {
	Flex,
	Box,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	InputRightElement,
	Stack,
	Button,
	Heading,
	Text,
	useColorModeValue,
	Link,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import UserType from "../contracts/user.js";

export default function LoginCard() {
	const [showPassword, setShowPassword] = useState(false);
	const setAuthScreen = useSetRecoilState(authScreenAtom);
	const setUser = useSetRecoilState(userAtom);
	const [loading, setLoading] = useState(false);

	const [inputs, setInputs] = useState({
		email: "",
		password: "",
		token: "",
	});
	const showToast = useShowToast();
	const handleLogin = async () => {
		setLoading(true);
		try {
			const user = await signInWithEmailAndPassword(
				auth,
				inputs.email,
				inputs.password,
			);

			const token = await user.user.getIdToken();
			if (token) {
				inputs.token = `Bearer ${token}`
				const res = await fetch("/api/users/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(inputs),
				});
				const data: UserType & { success?: string | boolean, error?: string } = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
				localStorage.setItem("user-threads", JSON.stringify(data));
				setUser(data);
			}
		} catch (error: any) {
			if (error.code == "auth/invalid-credential")
				return showToast("Error", "Invalid username or password", "error");
		} finally {
			setLoading(false);
		}
	};
	return (
		<Flex align={"center"} justify={"center"}>
			<Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
				<Stack align={"center"}>
					<Heading fontSize={"4xl"} textAlign={"center"}>
						Login to Sendchat
					</Heading>
				</Stack>
				<Box
					rounded={"lg"}
					bg={useColorModeValue("white", "gray.dark")}
					boxShadow={"lg"}
					p={8}
					w={{
						base: "full",
						sm: "400px",
					}}
				>
					<Stack spacing={4}>
						<FormControl isRequired>
							<FormLabel>Email</FormLabel>
							<Input
								type='email'
								value={inputs.email}
								onChange={(e) => setInputs((inputs) => ({ ...inputs, email: e.target.value.toLowerCase() }))}
								maxLength={25}
							/>
						</FormControl>
						<FormControl isRequired>
							<FormLabel>Password</FormLabel>
							<InputGroup>
								<Input
									type={showPassword ? "text" : "password"}
									value={inputs.password}
									onChange={(e) => setInputs((inputs) => ({ ...inputs, password: e.target.value }))}
									maxLength={195}
									minLength={7}
								/>
								<InputRightElement h={"full"}>
									<Button
										variant={"ghost"}
										onClick={() => setShowPassword((showPassword) => !showPassword)}
									>
										{showPassword ? <ViewIcon /> : <ViewOffIcon />}
									</Button>
								</InputRightElement>
							</InputGroup>
						</FormControl>
						<Stack spacing={10} pt={2}>
							<Button
								loadingText='Logging in'
								size='lg'
								bg={useColorModeValue("gray.600", "gray.700")}
								color={"white"}
								_hover={{
									bg: useColorModeValue("gray.700", "gray.800"),
								}}
								onClick={handleLogin}
								isLoading={loading}
							>
								Login
							</Button>
						</Stack>
						<Stack pt={6}>
							<Text align={"center"}>
								Don&apos;t have an account yet?{" "}
								<Link color={"blue.400"} onClick={() => setAuthScreen("signup")}>
									Sign up with IWS
								</Link>
							</Text>
						</Stack>
					</Stack>
				</Box>
			</Stack>
		</Flex>
	);
}
