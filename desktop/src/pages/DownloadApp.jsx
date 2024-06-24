import { Divider, Flex, useColorModeValue } from "@chakra-ui/react";

export default function DownloadApp() {
    return (
        <>
            <h1>Download our desktop app for a better experience!</h1>
            <Divider my={4} />
            <h3>
                <h1>NEW UPDATE</h1>
                New features in this update:
                <br />
                Minimize to tray
                <br />
                Get notified even when not in the app or in messages page
            </h3>
            <h2>The last update was on: 3/27/2024</h2>
            <Divider my={4} />
            <Flex
                flex='70'
                bg={useColorModeValue("gray.200", "gray.dark")}
                borderRadius={"md"}
                p={2}
                flexDirection={"column"}
            >
                <a href="https://drive.usercontent.google.com/download?id=1Zk72EYDNDaq9_sJPHEngKXc3N61qhxBL&export=download">Download Sendchat 3.27.1 for Windows</a>
            </Flex>
        </>
    );
};