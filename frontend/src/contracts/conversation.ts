export default interface ConversationType {
    mock?: boolean;
    lastMessage: LastMessage;
    _id: string | number;
    participants: Participant[];
    createdAt?: Date;
    updatedAt?: Date;
    __v?: number;
}

export interface LastMessage {
    seen?: boolean;
    text: string;
    sender: string;
}

export interface Participant {
    _id: string;
    name: string;
    username: string;
    profilePic: string;
}

export interface SelectedConversationType {
    mock?: boolean;
    _id: string | number;
    userId: string;
    username: string;
    name?: string;
    userProfilePic: string;
}