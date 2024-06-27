import { Divider, Flex, useColorModeValue } from "@chakra-ui/react";

export default function DownloadApp() {
    return (
        <>
            <h1>It's a chat app.</h1>
            <Divider my={4} />
            <h3>
                <h1>yeah um</h1>
                not quite sure what to uh
                <br />
                put here
                <br />
                click below to use
            </h3>
            <Divider my={4} />
            <Flex
                flex='70'
                bg={useColorModeValue("gray.200", "gray.dark")}
                borderRadius={"md"}
                p={2}
                flexDirection={"column"}
            >
                <a href="https://app.sendchat.xyz">Open Sendchat</a>
            </Flex>
        </>
    );
};