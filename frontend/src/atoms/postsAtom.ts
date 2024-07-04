import { atom } from "recoil";
import PostType from "../contracts/post";

const postsAtom = atom<PostType[]>({
	key: "postsAtom",
	default: [],
});

export default postsAtom;
