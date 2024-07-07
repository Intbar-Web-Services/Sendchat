import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { extendTheme } from "@chakra-ui/theme-utils";
import { ColorModeScript } from "@chakra-ui/color-mode";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";

const styles = {
	global: (props) => ({
		body: {
			color: mode("gray.800", "whiteAlpha.900")(props),
			bg: mode("gray.100", "#101010")(props),
		},
	}),
};

const config = {
	initialColorMode: "dark",
	useSystemColorMode: true,
};

const colors = {
	gray: {
		light: "#616161",
		dark: "#1e1e1e",
	},
};

const theme = extendTheme({ config, styles, colors });

if (navigator.userAgent.includes("sendchat-desktop")) {
	location.href = "https://app.sendchat.xyz/app";
}

console.log('STOP POSTING ABOUT SENDCHAT! IM TIRED OF SEEING IT! My friends on TikTok send me memes, on Discord its fucking memes. I was in a server, right, and ALL the channels are just SENDCHAT stuff. I showed my Champion underwear to my girlfriend, and the logo I flipped it and I said "Hey babe, when the underwear SENDCHAT! HAHA! Ding Ding Ding Ding Ding Ding Ding DiDiDing!" I fucking looked at a trash can and I said "Thats a bit SENDCHATsy!" I looked at my penis, I thought of the astronauts helmet and I go "PENIS? MORE LIKE PEN-SENDCHAT!" AAAAAAAAAAAAAA')

ReactDOM.createRoot(document.getElementById("root")).render(
	// React.StrictMode renders every component twice (in the initial render), only in development.
	<React.StrictMode>
		<RecoilRoot>
			<BrowserRouter>
				<ChakraProvider theme={theme}>
					<ColorModeScript initialColorMode={theme.config.initialColorMode} />
					<App />
				</ChakraProvider>
			</BrowserRouter>
		</RecoilRoot>
	</React.StrictMode>
);
