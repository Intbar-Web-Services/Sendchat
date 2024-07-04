import { atom } from "recoil";
import PostType from "../contracts/post";

const repliesAtom = atom<PostType[]>({
	key: "repliesAtom",
	default: [],
});

export default repliesAtom;
