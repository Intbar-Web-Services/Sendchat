import { atom } from "recoil";

export const conversationsAtom = atom({
	key: "conversationsAtom",
	default: [],
});

export const selectedConversationAtom = atom({
	key: "selectedConversationAtom",
	default: {
		mock: false,
		_id: "",
		userId: "",
		username: "",
		userProfilePic: ""
	},
});
export const newConversationAtom = atom({
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
