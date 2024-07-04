import mongoose from "mongoose";

export default interface User extends mongoose.Document {
    subscriptions: Subscriptions;
    punishment: Punishment;
    _id: string;
    name: string;
    username: string;
    isAdmin?: boolean;
    email: string;
    isDeleted: boolean;
    profilePic: string;
    followers: string[];
    following: string[];
    bio: string;
    likesHidden: boolean;
    firebaseId: string;
    isFrozen: boolean;
    createdAt: Date;
    __v: number;
    [key: string]: any
}

export interface Punishment {
    type: string;
    reason: string;
    hours: number | null;
    offenses: number;
}

export interface Subscriptions {
    posts: boolean;
    follow: boolean;
}
