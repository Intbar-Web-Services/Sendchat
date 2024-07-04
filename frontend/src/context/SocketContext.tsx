import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRecoilValue } from "recoil";
import io, { Socket } from "socket.io-client";
import userAtom from "../atoms/userAtom";

const SocketContext = createContext(Socket);

export const useSocket = () => {
	return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }: { children: ReactNode }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const user = useRecoilValue(userAtom);

	useEffect(() => {
		const socket = io("/", {
			query: {
				userId: user?._id,
			},
		});

		setSocket(socket as any);

		socket.on("getOnlineUsers", (users) => {
			setOnlineUsers(users);
		});
		return () => { socket && socket.close() };
	}, [user?._id]);

	return <SocketContext.Provider value={{ socket, onlineUsers } as any}>{children}</SocketContext.Provider>;
};
