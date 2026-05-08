import { create } from "zustand";
import api from "../utils/api.js";

const useChatStore = create((set, get) => ({
  rooms: [],
  activeRoom: null,
  messages: {},
  typingUsers: {},
  onlineUsers: new Set(),
  loadingRooms: false,
  loadingMessages: false,

  fetchRooms: async () => {
    set({ loadingRooms: true });
    try {
      const res = await api.get("/rooms");
      set({ rooms: res.data.data.rooms, loadingRooms: false });
    } catch {
      set({ loadingRooms: false });
    }
  },

  setActiveRoom: (room) => set({ activeRoom: room }),

  fetchMessages: async (roomId, page = 1) => {
    set({ loadingMessages: true });
    try {
      const res = await api.get(`/rooms/${roomId}/messages?page=${page}`);
      const incoming = res.data.data.messages;
      set((state) => ({
        messages: {
          ...state.messages,
          [roomId]: page === 1 ? incoming : [...incoming, ...(state.messages[roomId] || [])],
        },
        loadingMessages: false,
      }));
      return res.data.data.pagination;
    } catch {
      set({ loadingMessages: false });
    }
  },

  addMessage: (roomId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] || []), message],
      },
      rooms: state.rooms.map((r) =>
        r._id === roomId ? { ...r, lastMessage: message, updatedAt: new Date() } : r
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    }));
  },

  updateMessage: (roomId, messageId, updates) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: (state.messages[roomId] || []).map((m) =>
          m._id === messageId ? { ...m, ...updates } : m
        ),
      },
    }));
  },

  removeMessage: (roomId, messageId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: (state.messages[roomId] || []).map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, content: "This message was deleted" }
            : m
        ),
      },
    }));
  },

  addRoom: (room) => {
    set((state) => {
      const exists = state.rooms.find((r) => r._id === room._id);
      if (exists) return {};
      return { rooms: [room, ...state.rooms] };
    });
  },

  setTyping: (roomId, userId, username, isTyping) => {
    set((state) => {
      const key = `${roomId}:${userId}`;
      const current = { ...state.typingUsers };
      if (isTyping) {
        current[key] = { roomId, userId, username };
      } else {
        delete current[key];
      }
      return { typingUsers: current };
    });
  },

  getTypingForRoom: (roomId) => {
    const { typingUsers } = get();
    return Object.values(typingUsers).filter((t) => t.roomId === roomId);
  },

  setUserOnline: (userId, isOnline) => {
    set((state) => {
      const next = new Set(state.onlineUsers);
      isOnline ? next.add(userId) : next.delete(userId);
      return { onlineUsers: next };
    });
  },

  isUserOnline: (userId) => get().onlineUsers.has(userId),
}));

export default useChatStore;
