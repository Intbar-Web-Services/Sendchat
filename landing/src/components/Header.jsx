import { Button, Center, Flex, Image, Link, useColorMode, useColorModeValue, Box, Avatar } from "@chakra-ui/react";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { useRecoilValue, useSetRecoilState } from "recoil";

const Header = () => {
	const { colorMode, toggleColorMode } = useColorMode();

	return (
		<>

			<Flex
				mt={0}
				mb={9}
				position="fixed"
				zIndex="1"
				backgroundColor={useColorModeValue("gray.100", "#101010")}
				pt="0.1rem"
				webkitAppRegion="drag"
			>

				<Flex
					justifyContent="left"
					mt={0}
					zIndex={0}
					ml={5}
					right={0}
					paddingRight="35.5rem"
					paddingTop="1.2rem"
				>
					<Image
						cursor={"pointer"}
						onClick={() => { location.href = "https://sendchat.xyz"; }}
						alt='logo'
						position="relative"
						mt={0.5}
						h="4em"
						src="/wordmark.svg"
					/>
				</Flex>
				<Flex
					justifyContent="right"
					mt={0}
					position="fixed"
					zIndex={1}
					right={0}
					paddingRight="1.5rem"
					paddingTop="1.9rem"
				>
					<Button onClick={() => { location.href = "https://app.sendchat.xyz"; }}>Open Sendchat</Button>
				</Flex>
			</Flex >
		</>
	);
};

export default Header;
