import {
	Avatar,
	AvatarBadge,
	Box,
	Flex,
	Stack,
	Text,
	WrapItem,
	useColorModeValue,
} from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import ConversationType from "../contracts/conversation";

const Conversation = ({ conversation, isOnline }: { conversation: ConversationType, isOnline: boolean }) => {
	const user = conversation.participants[0];
	const currentUser = useRecoilValue(userAtom);
	const lastMessage = conversation.lastMessage;
	const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);

	return (
		<Flex
			gap={4}
			alignItems={"center"}
			p={"1"}
			_hover={{
				cursor: "pointer",
				bg: useColorModeValue("gray.300", "gray.dark"),
				color: "black",
			}}
			onClick={() =>
				setSelectedConversation({
					_id: conversation._id,
					userId: user._id,
					userProfilePic: user.profilePic,
					name: user.name,
					username: user.username,
					mock: conversation.mock,
				})
			}
			bg={
				// eslint-disable-next-line react-hooks/rules-of-hooks
				selectedConversation?._id === conversation._id ? (useColorModeValue("gray.300", "gray.dark")) : ""
			}
			borderRadius={"md"}
		>
			<WrapItem>
				<Avatar
					size={{
						base: "xs",
						sm: "sm",
						md: "md",
					}}
					src={user.profilePic}
					name={user.name}
				>
					{isOnline ? <AvatarBadge boxSize='1em' bg='green.500' /> : ""}
				</Avatar>
			</WrapItem>

			<Stack direction={"column"} fontSize={"sm"} spacing={0.8}>
				<Text fontWeight='700' display={"flex"} alignItems={"center"} color={useColorModeValue("black", "white")}>
					{user.name}
				</Text>
				<Text fontWeight='400' display={"flex"} alignItems={"center"} color={useColorModeValue("black", "gray.400")}>
					@{user.username}
				</Text>
				<Text fontSize={"xs"} display={"flex"} alignItems={"center"} gap={1} color={useColorModeValue("black", "white")}>
					{currentUser!._id === lastMessage.sender ? (
						<Box color={lastMessage.seen ? "blue.400" : ""}>
							<BsCheck2All size={16} />
						</Box>
					) : (
						""
					)}
					{lastMessage.text.length > 18
						? lastMessage.text.substring(0, 18) + "..."
						: lastMessage.text || <BsFillImageFill size={16} />}
				</Text>
			</Stack>
		</Flex>
	);
};

export default Conversation;
