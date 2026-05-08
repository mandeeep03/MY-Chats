import { useEffect, useRef, useState, useCallback } from "react";
import MessageBubble from "./MessageBubble.jsx";
import Avatar from "./Avatar.jsx";
import useChatStore from "../context/chatStore.js";
import useAuthStore from "../context/authStore.js";
import { useTyping } from "../hooks/useTyping.js";
import { getSocket } from "../utils/socket.js";
import { getRoomName, getRoomAvatar, getOtherUser, formatLastSeen } from "../utils/format.js";
import api from "../utils/api.js";

export default function ChatWindow({ room }) {
  const { user } = useAuthStore();
  const { messages, fetchMessages, addMessage, updateMessage, removeMessage, getTypingForRoom, isUserOnline } =
    useChatStore();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const bottomRef = useRef(null);
  const { emitTyping, stopTyping } = useTyping(room._id);

  const roomMessages = messages[room._id] || [];
  const typingList = getTypingForRoom(room._id).filter((t) => t.userId !== user?._id);
  const otherUser = getOtherUser(room, user?._id);
  const roomName = getRoomName(room, user?._id);
  const roomAvatar = getRoomAvatar(room, user?._id);
  const online = otherUser ? isUserOnline(otherUser._id) : false;

  useEffect(() => {
    setPage(1);
    fetchMessages(room._id, 1).then((pagination) => {
      if (pagination) setHasMore(pagination.hasMore);
    });
    const socket = getSocket();
    if (socket) socket.emit("room:join", { roomId: room._id });
  }, [room._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomMessages.length]);

  const loadMore = async () => {
    const nextPage = page + 1;
    const pagination = await fetchMessages(room._id, nextPage);
    if (pagination) {
      setPage(nextPage);
      setHasMore(pagination.hasMore);
    }
  };

  const handleSend = async () => {
    const text = content.trim();
    if (!text || sending) return;
    setSending(true);
    stopTyping();
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit("message:send", { roomId: room._id, content: text }, (res) => {
          if (res?.error) console.error(res.error);
        });
      } else {
        const res = await api.post(`/rooms/${room._id}/messages`, { content: text });
        addMessage(room._id, res.data.data.message);
      }
      setContent("");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = useCallback((messageId) => {
    const socket = getSocket();
    if (socket) {
      socket.emit("message:delete", { messageId });
    } else {
      api.delete(`/rooms/${room._id}/messages/${messageId}`).then(() => {
        removeMessage(room._id, messageId);
      });
    }
  }, [room._id]);

  const handleEdit = useCallback((messageId, newContent) => {
    const socket = getSocket();
    if (socket) {
      socket.emit("message:edit", { messageId, content: newContent });
    } else {
      api.patch(`/rooms/${room._id}/messages/${messageId}`, { content: newContent }).then((res) => {
        updateMessage(room._id, messageId, { content: newContent, editedAt: new Date() });
      });
    }
  }, [room._id]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-dark-700 bg-dark-800">
        <Avatar
          src={roomAvatar}
          name={roomName}
          size="md"
          online={room.type === "direct" ? online : undefined}
        />
        <div>
          <p className="text-sm font-semibold text-gray-100">{roomName}</p>
          {room.type === "direct" && otherUser && (
            <p className="text-xs text-gray-500">
              {online ? "Online" : `Last seen ${formatLastSeen(otherUser.lastSeen)}`}
            </p>
          )}
          {room.type === "group" && (
            <p className="text-xs text-gray-500">
              {room.members?.length} members
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {hasMore && (
          <div className="text-center mb-4">
            <button
              onClick={loadMore}
              className="text-xs text-gray-500 hover:text-gray-300 underline"
            >
              Load older messages
            </button>
          </div>
        )}

        {roomMessages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-600">No messages yet. Say something.</p>
          </div>
        )}

        {roomMessages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwn={msg.sender?._id === user?._id || msg.sender === user?._id}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}

        {typingList.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1 px-3 py-2 bg-dark-600 rounded-2xl rounded-tl-sm">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs text-gray-500">
              {typingList.map((t) => t.username).join(", ")} typing...
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-dark-700 bg-dark-800">
        <div className="flex gap-2 items-center">
          <input
            className="input-base flex-1"
            placeholder="Write a message..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              emitTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            onBlur={stopTyping}
          />
          <button
            className="btn-primary px-5"
            onClick={handleSend}
            disabled={!content.trim() || sending}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
