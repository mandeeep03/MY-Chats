import { useEffect } from "react";
import { getSocket } from "../utils/socket.js";
import useChatStore from "../context/chatStore.js";

export const useSocket = () => {
  const { addMessage, updateMessage, removeMessage, setTyping, setUserOnline, addRoom } =
    useChatStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onMessageNew = ({ message, roomId }) => {
      addMessage(roomId, message);
    };

    const onMessageEdited = ({ messageId, content, editedAt, roomId }) => {
      updateMessage(roomId, messageId, { content, editedAt });
    };

    const onMessageDeleted = ({ messageId, roomId }) => {
      removeMessage(roomId, messageId);
    };

    const onTypingUpdate = ({ userId, username, roomId, isTyping }) => {
      setTyping(roomId, userId, username, isTyping);
    };

    const onUserOnline = ({ userId, isOnline }) => {
      setUserOnline(userId, isOnline);
    };

    socket.on("message:new", onMessageNew);
    socket.on("message:edited", onMessageEdited);
    socket.on("message:deleted", onMessageDeleted);
    socket.on("typing:update", onTypingUpdate);
    socket.on("user:online", onUserOnline);

    return () => {
      socket.off("message:new", onMessageNew);
      socket.off("message:edited", onMessageEdited);
      socket.off("message:deleted", onMessageDeleted);
      socket.off("typing:update", onTypingUpdate);
      socket.off("user:online", onUserOnline);
    };
  }, [addMessage, updateMessage, removeMessage, setTyping, setUserOnline, addRoom]);
};
