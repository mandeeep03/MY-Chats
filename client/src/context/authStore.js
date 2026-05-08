import { create } from "zustand";
import api from "../utils/api.js";
import { connectSocket, disconnectSocket } from "../utils/socket.js";

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  loading: true,
  error: null,

  init: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const res = await api.get("/auth/me");
      const user = res.data.data.user;
      set({ user, token, loading: false });
      connectSocket(token);
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data.data;
    localStorage.setItem("token", token);
    set({ user, token });
    connectSocket(token);
    return user;
  },

  register: async (username, email, password) => {
    set({ error: null });
    const res = await api.post("/auth/register", { username, email, password });
    const { token, user } = res.data.data;
    localStorage.setItem("token", token);
    set({ user, token });
    connectSocket(token);
    return user;
  },

  logout: () => {
    localStorage.removeItem("token");
    disconnectSocket();
    set({ user: null, token: null });
  },

  updateUser: (updates) => {
    set((state) => ({ user: { ...state.user, ...updates } }));
  },
}));

export default useAuthStore;
