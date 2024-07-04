import {
	Flex,
	Image,
	Input,
	InputGroup,
	InputRightElement,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Spinner,
	useDisclosure,
} from "@chakra-ui/react";
import { FormEvent, useRef, useState, Dispatch } from "react";
import { IoSendSharp } from "react-icons/io5";
import useShowToast from "../hooks/useShowToast";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsFillImageFill } from "react-icons/bs";
import usePreviewImg from "../hooks/usePreviewImg";
import useGetUserProfile from "../hooks/useGetUserProfile";
import getCurrentUserId from "../user.js";
import MessageType from "../contracts/message.js";

const MessageInput = ({ setMessages }: { setMessages: Dispatch<React.SetStateAction<MessageType[]>> }) => {
	const [messageText, setMessageText] = useState("");
	const showToast = useShowToast();
	const selectedConversation = useRecoilValue(selectedConversationAtom);
	const setConversations = useSetRecoilState(conversationsAtom);
	const imageRef = useRef(null);
	const { onClose } = useDisclosure();
	const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
	const [isSending, setIsSending] = useState(false);

	const handleSendMessage = async (e: FormEvent) => {
		e.preventDefault();

		if (!messageText && !imgUrl) return;
		if (isSending) return;

		setIsSending(true);

		try {
			const res = await fetch("/api/messages", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"authorization": `Bearer ${await getCurrentUserId()}`,
				},
				body: JSON.stringify({
					message: messageText,
					recipientId: selectedConversation.userId,
					img: imgUrl,
				}),
			});
			const data: MessageType & { success?: string | boolean, error?: string } = await res.json();
			if (data.error) {
				if (data.error == "You are currently punished") {
					location.pathname = "/";
				}
				showToast("Error", data.error, "error");
				return;
			}
			setMessages((messages) => [...messages, data]);

			setConversations((prevConvs) => {
				const updatedConversations = prevConvs.map((conversation) => {
					if (conversation._id === selectedConversation._id) {
						return {
							...conversation,
							lastMessage: {
								text: messageText,
								sender: data.sender,
							},
						};
					}
					return conversation;
				});
				return updatedConversations;
			});
			setMessageText("");
			setImgUrl("");
		} catch (error: any) {
			showToast("Error", error.message, "error");
		} finally {
			setIsSending(false);
		}
	};
	return (
		<Flex gap={2} alignItems={"center"}>
			<form onSubmit={handleSendMessage} style={{ flex: 95 }}>
				<InputGroup>
					<Input
						w={"full"}
						placeholder='Type a message'
						onChange={(e) => setMessageText(e.target.value)}
						value={messageText}
					/>
					<InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
						<IoSendSharp />
					</InputRightElement>
				</InputGroup>
			</form>
			<Flex flex={5} cursor={"pointer"}>
				{/* @ts-expect-error */}
				<BsFillImageFill size={20} onClick={() => imageRef.current?.click()} />
				<Input type={"file"} hidden ref={imageRef} onChange={handleImageChange} />
			</Flex>
			<Modal
				// @ts-expect-error
				isOpen={imgUrl as boolean}
				onClose={() => {
					onClose();
					setImgUrl("");
				}}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader></ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Flex mt={5} w={"full"}>
							<Image src={imgUrl as string | undefined} />
						</Flex>
						<Flex justifyContent={"flex-end"} my={2}>
							{!isSending ? (
								<IoSendSharp size={24} cursor={"pointer"} onClick={handleSendMessage} />
							) : (
								<Spinner size={"md"} />
							)}
						</Flex>
					</ModalBody>
				</ModalContent>
			</Modal>
		</Flex>
	);
};

export default MessageInput;
