import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useShowToast from "./useShowToast";
import UserType from "../contracts/user";

const useGetUserProfile = (givenUsername: { username: string | undefined } | null = null) => {
	const [user, setUser] = useState<UserType | null>(null);
	const [loading, setLoading] = useState(true);
	let { username } = useParams();
	if (username == null && givenUsername != null) {
		({ username } = givenUsername);
	}
	const showToast = useShowToast();

	useEffect(() => {
		const getUser = async () => {
			try {
				if (username != null) {
					const res = await fetch(`/api/users/profile/${username}`);
					const data: UserType = await res.json();
					if (data.error) {
						showToast("Error", data.error, "error");
						return;
					}
					if (data.isFrozen) {
						setUser(null);
						return;
					}
					setUser(data);
				} else {
					setUser({ punishment: { type: "", reason: "" } } as UserType);
				}
			} catch (error: any) {
				showToast("Error", error.message, "error");
			} finally {
				setLoading(false);
			}
		};
		getUser();
	}, [username, showToast]);

	return { loading, user };
};

export default useGetUserProfile;
