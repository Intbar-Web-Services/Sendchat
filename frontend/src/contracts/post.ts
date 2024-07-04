export default interface PostType {
    _id:       string;
    postedBy:  string;
    text:      string;
    img:       null;
    likes:     string[];
    replies:   Reply[];
    createdAt: Date;
    updatedAt: Date;
    __v:       number;
    [key: string]: any;
}

export interface Reply {
    userId:         string;
    text:           string;
    userProfilePic: string;
    username:       string;
    name:           string;
    _id:            string;
}
