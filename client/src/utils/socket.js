import { io } from "socket.io-client";

let socket = null;

const BACKEND_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://my-chats-k92n.onrender.com";

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(BACKEND_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
