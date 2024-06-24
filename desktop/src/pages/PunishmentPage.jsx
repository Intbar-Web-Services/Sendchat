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
import useLogout from "../hooks/useLogout";

const PunishmentPage = ({ user, type, reason, hours }) => {
    const [loading, setLoading] = useState(false);
    const logout = useLogout();

    return (
        <Flex align={"center"} justify={"center"}>
            <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={12}>
                <Stack align={"center"}>
                    <Heading fontSize={"4xl"} textAlign={"center"}>
                        Your account has been punished.
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
                        <Text fontWeight='semibold'>Unfortunately, your account has been punished. {type == "warn" ? "Review and resolve" : "Review"} on the web and come back here to reload.</Text>
                        <Stack spacing={10} pt={2}>
                            <Button
                                marginTop={-6}
                                size='lg'
                                loadingText="Reloading..."
                                isLoading={loading}
                                onClick={() => { setLoading(true); window.location.reload(); }}
                                bg={useColorModeValue("gray.600", "gray.700")}
                                color={"white"}
                                _hover={{
                                    bg: useColorModeValue("gray.700", "gray.800"),
                                }}
                            >
                                Reload
                            </Button>
                            <Button
                                marginTop={-6}
                                size='lg'
                                onClick={() => { logout(); window.location.reload(); }}
                                bg={useColorModeValue("gray.600", "gray.700")}
                                color={"white"}
                                _hover={{
                                    bg: useColorModeValue("gray.700", "gray.800"),
                                }}
                            >
                                Log out
                            </Button>
                            <Button
                                marginTop={-6}
                                size='lg'
                                onClick={() => (open("https://sendchat.xyz/", '_blank').focus())}
                                bg={useColorModeValue("gray.600", "gray.700")}
                                color={"white"}
                                _hover={{
                                    bg: useColorModeValue("gray.700", "gray.800"),
                                }}
                            >
                                {type == "warn" ? "Review and resolve" : "Review"}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
};

export default PunishmentPage;