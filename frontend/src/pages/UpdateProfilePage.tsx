import {
	Button,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	Input,
	Stack,
	useColorModeValue,
	Avatar,
	Center,
	Text,
} from "@chakra-ui/react";
import { useRef, useState, useEffect, FormEvent } from "react";
import { useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import usePreviewImg from "../hooks/usePreviewImg";
import useShowToast from "../hooks/useShowToast";
import { useSocket } from "../context/SocketContext.tsx";
// @ts-expect-error
import messageSound from "../assets/sounds/message.mp3";
import getCurrentUserId from "../user.js";
import UserType from "../contracts/user.ts";

export default function UpdateProfilePage() {
	const [user, setUser] = useRecoilState(userAtom);
	const [inputs, setInputs] = useState({
		name: user!.name,
		username: user!.username,
		email: user!.email,
		bio: user!.bio,
		password: "",
	});
	const fileRef = useRef<null | any>(null);
	const [updating, setUpdating] = useState(false);
	const { socket } = useSocket() as any;
	useEffect(() => {
		if (socket) {
			socket.on("newMessage", () => {

				// make a sound if the window is not focused
				const sound = new Audio(messageSound);
				sound.play();
			});

			return () => socket.off("newMessage");
		}
	}, [socket]);

	const showToast = useShowToast();

	const { handleImageChange, imgUrl } = usePreviewImg();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (updating) return;
		setUpdating(true);
		try {
			const res = await fetch(`/api/users/update/${user!._id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"authorization": `Bearer ${await getCurrentUserId()}`,
				},
				body: JSON.stringify({ ...inputs, profilePic: imgUrl }),
			});
			const data: UserType & { success?: string | boolean, error?: string } = await res.json(); // updated user object
			if (data.error) {
				showToast("Error", data.error, "error");
				if (data.error == "You are currently punished") {
					location.pathname = "/";
				}
				return;
			}
			showToast("Success", "Profile updated successfully", "success");
			setUser(data);
			localStorage.setItem("user-threads", JSON.stringify(data));
		} catch (error: any) {
			showToast("Error", error, "error");
		} finally {
			setUpdating(false);
		}
	};
	return (
		<form onSubmit={handleSubmit}>
			<Flex align={"center"} justify={"center"} my={6}>
				<Stack
					spacing={4}
					w={"full"}
					maxW={"md"}
					bg={useColorModeValue("white", "gray.dark")}
					rounded={"xl"}
					boxShadow={"lg"}
					p={6}
				>
					<Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }} textAlign={"center"}>
						Edit IWS Profile
					</Heading>
					<FormControl id='userName'>
						<Stack direction={["column", "row"]} spacing={6}>
							<Center>
								<Avatar size='xl' boxShadow={"md"} src={imgUrl || user!.profilePic} />
							</Center>
							<Center w='full'>
								<Button w='full' onClick={() => fileRef.current?.click()}>
									Change Avatar
								</Button>
								<Input type='file' hidden ref={fileRef} onChange={handleImageChange} />
							</Center>
						</Stack>
					</FormControl>
					<FormControl>
						<FormLabel>Display Name</FormLabel>
						<Input
							placeholder='John Doe'
							value={inputs.name}
							onChange={(e) => setInputs({ ...inputs, name: e.target.value.replace(/[^a-zA-Z0-9_. ]/g, "") })}
							_placeholder={{ color: "gray.500" }}
							type='text'
							maxLength={30}
						/>
					</FormControl>
					<FormControl>
						<FormLabel>Username</FormLabel>
						<Flex justify="center" gap={2}>
							<Text paddingTop={1} fontWeight='500' fontSize={'19'}>@</Text>
							<Input
								placeholder='johndoe12'
								value={inputs.username}
								onChange={(e) => setInputs({ ...inputs, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
								type='text'
								maxLength={25}
							/>
						</Flex>
					</FormControl>
					<FormControl>
						<FormLabel>Email address</FormLabel>
						<Input
							placeholder='youremail@example.com'
							value={inputs.email}
							onChange={(e) => setInputs({ ...inputs, email: e.target.value.toLowerCase() })}
							_placeholder={{ color: "gray.500" }}
							type='email'
							maxLength={120}
						/>
					</FormControl>
					<FormControl>
						<FormLabel>Bio</FormLabel>
						<Input
							placeholder='Your bio.'
							value={inputs.bio}
							onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
							_placeholder={{ color: "gray.500" }}
							type='text'
						/>
					</FormControl>
					<FormControl>
						<FormLabel>IWS Account Password</FormLabel>
						<Input
							placeholder='Somethingsecure123'
							value={inputs.password}
							onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
							_placeholder={{ color: "gray.500" }}
							type='password'
							maxLength={195}
							minLength={7}
						/>
					</FormControl>
					<Stack spacing={6} direction={["column", "row"]}>
						<Button
							bg={"red.400"}
							color={"white"}
							w='full'
							_hover={{
								bg: "red.500",
							}}
						>
							Cancel
						</Button>
						<Button
							bg={"green.400"}
							color={"white"}
							w='full'
							_hover={{
								bg: "green.500",
							}}
							type='submit'
							isLoading={updating}
						>
							Submit
						</Button>
					</Stack>
				</Stack>
			</Flex>
		</form>
	);
}
