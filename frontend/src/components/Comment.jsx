import { Avatar, Divider, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { Link } from "react-router-dom";

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
					<Text>{reply.text}</Text>
				</Flex>
			</Flex>
			{!lastReply ? <Divider /> : null}
		</>
	);
};

export default Comment;
