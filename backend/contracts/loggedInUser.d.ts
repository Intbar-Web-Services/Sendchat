import { Request } from "express";
import User from "./user";

export default interface LoggedInUserRequest extends Request {
    user: User, 
}