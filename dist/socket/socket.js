import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    // @ts-ignore
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
export const getRecipientSocketId = (recipientId) => {
    return userSocketMap[recipientId];
};
const userSocketMap = {}; // userId: socketId
io.on("connection", (socket) => {
    console.log("user connected", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId != "undefined")
        userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
        try {
            await Message.updateMany({ conversationId: conversationId, seen: false }, { $set: { seen: true } });
            await Conversation.updateOne({ _id: conversationId }, { $set: { "lastMessage.seen": true } });
            io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
        }
        catch (error) {
            console.log(error);
        }
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});
export { io, server, app };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYmFja2VuZC9zb2NrZXQvc29ja2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDbkMsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBQ3hCLE9BQU8sT0FBTyxNQUFNLFNBQVMsQ0FBQztBQUM5QixPQUFPLE9BQU8sTUFBTSwyQkFBMkIsQ0FBQztBQUNoRCxPQUFPLFlBQVksTUFBTSxnQ0FBZ0MsQ0FBQztBQUMxRCxNQUFNLEdBQUcsR0FBRyxPQUFPLEVBQUUsQ0FBQztBQUV0QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtJQUM1QixhQUFhO0lBQ2IsSUFBSSxFQUFFO1FBQ0osTUFBTSxFQUFFLEdBQUc7UUFDWCxPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDO0tBQ3pCO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxXQUErQixFQUFFLEVBQUU7SUFDdEUsT0FBTyxhQUFhLENBQUMsV0FBcUIsQ0FBQyxDQUFDO0FBQzlDLENBQUMsQ0FBQztBQUVGLE1BQU0sYUFBYSxHQUFRLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQjtBQUVsRCxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFO0lBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQWdCLENBQUM7SUFFdkQsSUFBSSxNQUFNLElBQUksV0FBVztRQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO0lBQzdELEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO0lBRXRELE1BQU0sQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7UUFDbkUsSUFBSSxDQUFDO1lBQ0gsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUN0QixFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUMvQyxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUN6QixDQUFDO1lBQ0YsTUFBTSxZQUFZLENBQUMsU0FBUyxDQUMxQixFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsRUFDdkIsRUFBRSxJQUFJLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUN2QyxDQUFDO1lBQ0YsRUFBRSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckIsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNqQyxPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QixFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDO0FBRUgsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMifQ==