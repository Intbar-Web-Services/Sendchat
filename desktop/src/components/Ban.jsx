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
import useShowToast from "../hooks/useShowToast";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";

const Ban = ({ user, reason, hours }) => {
    const logout = useLogout();

    return (
        <Flex align={"center"} justify={"center"}>
            <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={12}>
                <Stack align={"center"}>
                    <Heading fontSize={"4xl"} textAlign={"center"}>
                        Your account has been terminated
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
                        <Text fontWeight='semibold'>We're showing you this message your account, {user.name} (@{user.username}), has been terminated. Your account will be anonymized and all personal information removed within 30 days.</Text>

                        <Text fontWeight='bold'>Reason:</Text>
                        <Text marginTop={1} marginBottom={5}>{reason ? reason : "No reason given."}</Text>
                        <Stack spacing={10} pt={2}>
                            <Button
                                marginTop={-6}
                                size='lg'
                                onClick={() => logout()}
                                bg={useColorModeValue("gray.600", "gray.700")}
                                color={"white"}
                                _hover={{
                                    bg: useColorModeValue("gray.700", "gray.800"),
                                }}
                            >
                                Log out
                            </Button>
                        </Stack>
                        <Stack pt={0}>
                            <Text align={"center"}>
                                Learn about our rules: {" "}
                                <Link color={"blue.400"}>
                                    Sendchat Rules
                                </Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
};

export default Ban;