import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ChakraProvider, StyleProps } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { extendTheme } from "@chakra-ui/theme-utils";
import { ColorModeScript } from "@chakra-ui/color-mode";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { SocketContextProvider } from "./context/SocketContext.tsx";

const styles = {
  global: (props: StyleProps) => ({
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
  location.pathname = "/app";
}

ReactDOM.createRoot(
  document.getElementById("root") as Element | DocumentFragment
).render(
  // React.StrictMode renders every component twice (in the initial render), only in development.
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <SocketContextProvider>
            <>
              legacy
              <App />
            </>
          </SocketContextProvider>
        </ChakraProvider>
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>
);
