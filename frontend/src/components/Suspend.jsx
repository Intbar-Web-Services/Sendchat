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
import { useState } from "react";
import useLogout from "../hooks/useLogout";

const Suspend = ({ user, reason, hours }) => {
    const showToast = useShowToast();
    const [loading, setLoading] = useState(false);
    const unsuspend = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/punishments/unsuspend`);
            if (res.error) return showToast("Error", res.error, "error");
            location.reload();
        } finally {
            setLoading(false);
        }
    };
    const time = ((hours) - (Math.floor(new Date().getTime())) / 1000) / 3600;
    if (time <= 0) {
        unsuspend();
    }

    function SplitTime(numberOfHours) {
        var days = Math.floor(numberOfHours / 24);
        var remainder = numberOfHours % 24;
        var hours = Math.floor(remainder);
        var minutes = Math.floor(60 * (remainder - hours));
        return ({ days, hours, minutes })
    }

    const { days, hours: hoursParsed, minutes } = SplitTime(time);

    const logout = useLogout();

    return (
        <Flex align={"center"} justify={"center"}>
            <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={12}>
                <Stack align={"center"}>
                    <Heading fontSize={"4xl"} textAlign={"center"}>
                        Your account has been suspended.
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
                        <Text fontWeight='semibold'>We're showing you this message because your account, {user.name} (@{user.username}), has been suspended. Until the time runs out, you cannot interact with Sendchat.</Text>
                        <Text fontWeight='bold'>You have {days} day{(days > 1 || days === 0) ? "s" : ""} left, {hoursParsed} hour{(hoursParsed > 1 || hoursParsed === 0) ? "s" : ""} left, and {minutes} minute{(minutes > 1 || minutes === 0) ? "s" : ""} left</Text>

                        <Text fontWeight='bold'>Reason:</Text>
                        <Text marginTop={1} marginBottom={5}>{reason ? reason : "No reason given."}</Text>
                        <Stack spacing={10} pt={2}>
                            <Button
                                marginTop={-6}
                                size='lg'
                                loadingText="Reloading..."
                                isLoading={loading}
                                onClick={() => { setLoading(true); location.reload() }}
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

export default Suspend;