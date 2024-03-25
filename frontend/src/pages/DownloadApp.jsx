import { Divider, Flex, useColorModeValue } from "@chakra-ui/react";

export default function DownloadApp() {
    return (
        <>
            <h1>Download our desktop app for a better experience!</h1>
            <Divider my={4} />
            <h3>Features:
                <br />
                Quick access to Sendchat on the desktop
            </h3>

            <h3>Features coming soon:
                <br />
                Minimize to tray
            </h3>
            <h2>Check back soon, there will be continuous updates!
                <br />
                Last update was on: 3/24/2024
            </h2>
            <Divider my={4} />
            <Flex
                flex='70'
                bg={useColorModeValue("gray.200", "gray.dark")}
                borderRadius={"md"}
                p={2}
                flexDirection={"column"}
            >
                <a href="https://cdn.discordapp.com/attachments/937901772226310174/1221649272592924753/Sendchat_Installer.exe?ex=6613588b&is=6600e38b&hm=110ee3f5633d48942d7f5b4f36dce0c720757b97734ffe72eccffa4f003265ba&">Download Sendchat 3.24</a>
            </Flex>
        </>
    );
};