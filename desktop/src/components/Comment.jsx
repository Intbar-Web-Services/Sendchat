import { Avatar, Divider, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import Linkify from "react-linkify";

const Comment = ({ reply, lastReply }) => {
	return (
		<>
			<Flex gap={4} py={2} my={2} w={"full"}>
				<Link to={`/user/${reply.username}`}>
					<Avatar src={reply.userProfilePic} size={"sm"} name={reply.name} />
				</Link>
				<Flex gap={1} w={"full"} flexDirection={"column"}>
					<Link to={`/user/${reply.username}`}>
						<Flex w={"full"} gap={2} alignItems={"center"}>
							<Text fontSize='sm' fontWeight='bold'>
								{reply.name}
							</Text>
							<Text fontWeight='400' display={"flex"} alignItems={"center"} color={useColorModeValue("black", "gray.400")}>
								{`(`}@{reply.username}{`)`}
							</Text>
						</Flex>
					</Link>
					<Linkify
						componentDecorator={(decoratedHref, decoratedText, key) => (
							<a target="blank" href={decoratedHref} key={key}>
								{decoratedText}
							</a>
						)}
					>
						<Text>{reply.text}</Text>
					</Linkify>
				</Flex>
			</Flex>
			{!lastReply ? <Divider /> : null}
		</>
	);
};

export default Comment;
