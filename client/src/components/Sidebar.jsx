import { useEffect, useState } from "react";
import RoomItem from "./RoomItem.jsx";
import Avatar from "./Avatar.jsx";
import useChatStore from "../context/chatStore.js";
import useAuthStore from "../context/authStore.js";
import api from "../utils/api.js";

export default function Sidebar({ onSelectRoom, activeRoomId }) {
  const { rooms, fetchRooms, addRoom, loadingRooms } = useChatStore();
  const { user, logout } = useAuthStore();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(search)}`);
        setSearchResults(res.data.data.users);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  const startDirect = async (userId) => {
    try {
      const res = await api.post("/rooms/direct", { userId });
      const room = res.data.data.room;
      addRoom(room);
      onSelectRoom(room);
      setSearch("");
      setSearchResults([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="w-72 bg-dark-800 flex flex-col border-r border-dark-700 h-full">
      <div className="p-4 border-b border-dark-700 flex items-center justify-between">
        <span className="text-base font-semibold text-gray-100">Messages</span>
        <button
          onClick={logout}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Sign out
        </button>
      </div>

      <div className="p-3">
        <input
          className="input-base text-sm"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {search.length >= 2 ? (
          <div>
            <p className="text-xs text-gray-600 px-2 mb-2">People</p>
            {searching && (
              <p className="text-xs text-gray-500 px-2">Searching...</p>
            )}
            {searchResults.map((u) => (
              <button
                key={u._id}
                onClick={() => startDirect(u._id)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-dark-700 transition-colors"
              >
                <Avatar src={u.avatar} name={u.username} size="sm" />
                <div className="text-left">
                  <p className="text-sm text-gray-100">{u.username}</p>
                  {u.bio && <p className="text-xs text-gray-500 truncate">{u.bio}</p>}
                </div>
              </button>
            ))}
            {!searching && searchResults.length === 0 && (
              <p className="text-xs text-gray-500 px-2">No users found</p>
            )}
          </div>
        ) : (
          <div>
            {loadingRooms && (
              <p className="text-xs text-gray-500 px-2 py-4 text-center">Loading...</p>
            )}
            {!loadingRooms && rooms.length === 0 && (
              <p className="text-xs text-gray-500 px-2 py-4 text-center">
                No conversations yet. Search for someone to start chatting.
              </p>
            )}
            {rooms.map((room) => (
              <RoomItem
                key={room._id}
                room={room}
                active={room._id === activeRoomId}
                onClick={() => onSelectRoom(room)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-dark-700 flex items-center gap-3">
        <Avatar src={user?.avatar} name={user?.username} size="sm" online={true} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-100 truncate">{user?.username}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
}
