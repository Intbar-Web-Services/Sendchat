import userAtom from "../atoms/userAtom";
import { useSetRecoilState } from "recoil";
import useShowToast from "./useShowToast";
import { messaging, auth } from "../firebase";
import getCurrentUserId from "../user";

const useLogout = () => {
	const setUser = useSetRecoilState(userAtom);
	const showToast = useShowToast();

	const logout = async () => {
		try {
			const res = await fetch("/api/users/logout", {
				method: "POST",
				body: JSON.stringify({ oldToken: messaging.token }),
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

	return logout;
};

export default useLogout;
