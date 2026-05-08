export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const day = 24 * 60 * 60 * 1000;

  if (diff < day && d.getDate() === now.getDate()) return "Today";
  if (diff < 2 * day) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const formatLastSeen = (date) => {
  if (!date) return "a while ago";
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getRoomName = (room, currentUserId) => {
  if (room.type === "group") return room.name;
  const other = room.members?.find((m) => m.user?._id !== currentUserId);
  return other?.user?.username || "Unknown";
};

export const getRoomAvatar = (room, currentUserId) => {
  if (room.type === "group") return room.avatar || null;
  const other = room.members?.find((m) => m.user?._id !== currentUserId);
  return other?.user?.avatar || null;
};

export const getOtherUser = (room, currentUserId) => {
  if (room.type !== "direct") return null;
  return room.members?.find((m) => m.user?._id !== currentUserId)?.user || null;
};
