import { Avatar, Divider, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Comment = ({ reply, lastReply }) => {
	return (
		<>
			<Flex gap={4} py={2} my={2} w={"full"}>
				<Link to={`/user/${reply.username}`}>
					<Avatar src={reply.userProfilePic} size={"sm"} />
				</Link>
				<Flex gap={1} w={"full"} flexDirection={"column"}>
					<Link to={`/user/${reply.username}`}>
						<Flex w={"full"} justifyContent={"space-between"} alignItems={"center"}>
							<Text fontSize='sm' fontWeight='bold'>
								{reply.username}
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
