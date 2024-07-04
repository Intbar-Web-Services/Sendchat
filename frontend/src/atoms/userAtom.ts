import { atom } from "recoil";
import UserType from "../contracts/user";

const userAtom = atom<UserType | null>({
	key: "userAtom",
	default: JSON.parse(localStorage.getItem("user-threads") as string),
});

export default userAtom;
