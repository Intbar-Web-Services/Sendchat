import { Divider, Flex, useColorModeValue } from "@chakra-ui/react";

export default function DownloadApp() {
    return (
        <>
            <h1>Sendchat</h1>
            <Divider my={4} />
            <h3>
                <h1>Sendchat is the most used least used social media platform on the internet</h1>
                With over 1 users, Sendchat is booming in popularity!
                <br />
                With over 0 chats sent per day, there is no doubt you will love our &quot;active&quot; chat platform
                <br />
                Button which makes the app do applike things
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
}