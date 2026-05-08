import Avatar from "./Avatar.jsx";
import { formatDate, getRoomName, getRoomAvatar, getOtherUser } from "../utils/format.js";
import useAuthStore from "../context/authStore.js";
import useChatStore from "../context/chatStore.js";

export default function RoomItem({ room, active, onClick }) {
  const { user } = useAuthStore();
  const { isUserOnline } = useChatStore();

  const name = getRoomName(room, user?._id);
  const avatar = getRoomAvatar(room, user?._id);
  const otherUser = getOtherUser(room, user?._id);
  const online = otherUser ? isUserOnline(otherUser._id) : false;

  const lastMsg = room.lastMessage;
  const preview = lastMsg
    ? lastMsg.isDeleted
      ? "Message deleted"
      : lastMsg.content?.slice(0, 45) + (lastMsg.content?.length > 45 ? "..." : "")
    : "No messages yet";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
        active ? "bg-dark-600" : "hover:bg-dark-700"
      }`}
    >
      <Avatar
        src={avatar}
        name={name}
        size="md"
        online={room.type === "direct" ? online : undefined}
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-100 truncate">{name}</span>
          {lastMsg && (
            <span className="text-xs text-gray-600 ml-2 flex-shrink-0">
              {formatDate(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{preview}</p>
      </div>
    </button>
  );
}
