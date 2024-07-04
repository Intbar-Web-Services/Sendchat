import { atom } from "recoil";
import ConversationType, { SelectedConversationType } from "../contracts/conversation";

export const conversationsAtom = atom<ConversationType[]>({
	key: "conversationsAtom",
	default: [],
});

export const selectedConversationAtom = atom<SelectedConversationType>({
	key: "selectedConversationAtom",
	default: {
		mock: false,
		_id: "",
		userId: "",
		username: "",
		userProfilePic: ""
	},
});
export const newConversationAtom = atom<ConversationType>({
	key: "newConversationAtom",
	default: {
		mock: true,
		lastMessage: {
			text: "",
			sender: "",
		},
		_id: Date.now(),
		participants: [
			{
				_id: "",
				username: "",
				name: "",
				profilePic: ""
			},
		],
	},
})
