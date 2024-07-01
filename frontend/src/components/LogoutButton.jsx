import { Button } from "@chakra-ui/button";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import { FiLogOut } from "react-icons/fi";
import getCurrentUserId from "../user.js";
import { auth } from "../firebase.js";

const LogoutButton = () => {
	const setUser = useSetRecoilState(userAtom);
	const showToast = useShowToast();

	const handleLogout = async () => {
		try {
			const res = await fetch("/api/users/logout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"authorization": `Bearer ${await getCurrentUserId()}`,
				},
			});
			const data = await res.json();

			if (data.error) {
				showToast("Error", data.error, "error");
				return;
			}

			await auth.signOut();
			localStorage.removeItem("user-threads");
			setUser(null);
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};
	return (
		<Button position={"fixed"} top={"30px"} right={"30px"} size={"sm"} onClick={handleLogout}>
			<FiLogOut size={20} />
		</Button>
	);
};

export default LogoutButton;
