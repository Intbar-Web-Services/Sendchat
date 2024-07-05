import { Divider, Flex, Box, Button, Image, Center } from "@chakra-ui/react";

export default function DownloadApp() {
    return (
        <>
            <h1 style={{ "font-size": 72, "textAlign": "center" }}>Sendchat</h1>
            <h1 style={{ "font-size": 26, "textAlign": "center" }}>The most used least used social media platform on the internet</h1>
            <Center><Image src="getaroom.gif" maxW={"30%"} maxH={"30%"}/></Center>
            <Divider my={4} />
            <h3>
                With over -32,767 users, Sendchat is booming in popularity!
                <br />
                With over −170,141,183,460,469,231,731,687,303,715,884,105,728 chats sent per day, there is no doubt you will love our &quot;active&quot; chat platform
                <br />
                Sorry, we're down, or are we? (vsauce music)
                <br />
                See, since the website sendchat.xyz is always up, that means that it can never be &quot;down&quot;
                <br />
                Which means that Sendchat is the first platform with true 24/8 uptime.
                <br />
                - mercy
            </h3>
            <Divider my={4} />
            <Flex
                flex='70'
                borderRadius={"md"}
                p={2}
                flexDirection={"column"}
            >
                <Center><Button onClick={() => { location.href = "https://app.legacy.sendchat.xyz" }} position="fixed">Try out Sendchat!</Button></Center>
            </Flex>
        </>
    );
}
