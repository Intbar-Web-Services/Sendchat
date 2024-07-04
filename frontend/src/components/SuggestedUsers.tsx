import { Box, Flex, Skeleton, SkeletonCircle, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import SuggestedUser from "./SuggestedUser";
import useShowToast from "../hooks/useShowToast";
import getCurrentUserId from "../user.js";
import UserType from "../contracts/user.js";

const SuggestedUsers = () => {
	const [loading, setLoading] = useState(true);
	const [suggestedUsers, setSuggestedUsers] = useState<UserType[]>([]);
	const showToast = useShowToast();

	useEffect(() => {
		const getSuggestedUsers = async () => {
			setLoading(true);
			try {
				const res = await fetch("/api/users/suggested", {
					headers: {
						"authorization": `Bearer ${await getCurrentUserId()}`,
					}
				});
				const data: UserType[] & { success?: string | boolean, error?: string } = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
				setSuggestedUsers(data);
			} catch (error: any) {
				showToast("Error", error.message, "error");
			} finally {
				setLoading(false);
			}
		};

		getSuggestedUsers();
	}, [showToast]);

	return (
		<>
			<Text mb={4} fontWeight={"bold"} position="fixed">
				Suggested People
			</Text>
			<Flex direction={"column"} gap={4} position="fixed" paddingTop={10}>
				{!loading && suggestedUsers.map((user) => <SuggestedUser key={user._id} user={user} />)}
				{loading &&
					[0, 1, 2, 3, 4].map((_, idx) => (
						<Flex cursor="progress" key={idx} gap={2} alignItems={"center"} p={"1"} borderRadius={"md"}>
							{/* avatar skeleton */}
							<Box>
								<SkeletonCircle size={"10"} />
							</Box>
							{/* username and fullname skeleton */}
							<Flex w={"full"} flexDirection={"column"} gap={2}>
								<Skeleton h={"8px"} w={"80px"} />
								<Skeleton h={"8px"} w={"90px"} />
							</Flex>
							{/* follow button skeleton */}
							<Flex>
								<Skeleton h={"20px"} w={"60px"} />
							</Flex>
						</Flex>
					))}
			</Flex>
		</>
	);
};

export default SuggestedUsers;

// Loading skeletons for suggested users, if u want to copy and paste as shown in the tutorial

// <Flex key={idx} gap={2} alignItems={"center"} p={"1"} borderRadius={"md"}>
// 							{/* avatar skeleton */}
// 							<Box>
// 								<SkeletonCircle size={"10"} />
// 							</Box>
// 							{/* username and fullname skeleton */}
// 							<Flex w={"full"} flexDirection={"column"} gap={2}>
// 								<Skeleton h={"8px"} w={"80px"} />
// 								<Skeleton h={"8px"} w={"90px"} />
// 							</Flex>
// 							{/* follow button skeleton */}
// 							<Flex>
// 								<Skeleton h={"20px"} w={"60px"} />
// 							</Flex>
// 						</Flex>
