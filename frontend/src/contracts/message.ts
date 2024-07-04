export default interface MessageType {
    _id?: string;
    conversationId: string | number;
    sender: string;
    text?: string;
    seen?: boolean;
    img?: string;
    createdAt?: Date;
    updatedAt?: Date;
    __v?: number;
}