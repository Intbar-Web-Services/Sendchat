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
import useLogout from "../hooks/useLogout";
import { useState } from "react";
import getCurrentUserId from "../user";

const Warn = ({ user, reason }) => {
    const showToast = useShowToast();
    const setUser = useSetRecoilState(userAtom);
    const [loading, setLoading] = useState(false);
    const logout = useLogout();

    const unWarn = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/punishments/unwarn", {
                headers: {
                    "authorization": `Bearer ${await getCurrentUserId()}`
                }
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                setLoading(false);
                return;
            }
            localStorage.setItem("user-threads", JSON.stringify(data));
            setUser(data);
            location.pathname = "/";
        } catch (err) {
            showToast("Error", data.error, "error");
            setLoading(false);
        };
    }

    return (
        <Flex align={"center"} justify={"center"}>
            <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
                <Stack align={"center"}>
                    <Heading fontSize={"4xl"} textAlign={"center"}>
                        You&apos;ve been warned
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
                        <Text fontWeight='semibold'>We're showing you this message because you've been warned either by an admin or by the system</Text>

                        <Text fontWeight='bold'>Reason:</Text>
                        <Text>{reason ? reason : "No reason given.s"}</Text>
                        <Stack spacing={10} pt={2}>
                            <Button
                                loadingText='Redirecting to feed...'
                                size='lg'
                                bg={useColorModeValue("gray.600", "gray.700")}
                                onClick={unWarn}
                                color={"white"}
                                isLoading={loading}
                                _hover={{
                                    bg: useColorModeValue("gray.700", "gray.800"),
                                }}
                            >
                                I understand, go back to feed
                            </Button>
                            <Button
                                marginTop={-6}
                                size='lg'
                                onClick={() => { logout(); location.reload(); }}
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

export default Warn;