import { Box, Container, Flex, Spinner, Text } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import HomePage from "./pages/HomePage.jsx";

function App() {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	return (
		<>
			<Header />
			<Box position={"relative"} w='full'
				mt="0rem"
				p="6rem"
			>
				<Container maxW={pathname === "/" ? { base: "620px", md: "900px" } : "620px"}>

					<Routes>
						<Route path='/' element={<HomePage />} />
					</Routes>
				</Container>
			</Box>
		</>
	);
}
export default App;
