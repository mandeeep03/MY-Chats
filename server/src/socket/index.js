import { verifyToken } from "../utils/token.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Room from "../models/Room.js";
import logger from "../utils/logger.js";

const onlineUsers = new Map();

export const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();

    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      socketId: socket.id,
      lastSeen: new Date(),
    });

    const userRooms = await Room.find({ "members.user": userId }).select("_id");
    userRooms.forEach((room) => socket.join(room._id.toString()));

    io.emit("user:online", { userId, isOnline: true });

    logger.info(`User connected: ${socket.user.username} (${socket.id})`);

    socket.on("message:send", async (data, callback) => {
      try {
        const { roomId, content, type = "text" } = data;

        const room = await Room.findById(roomId);
        if (!room || !room.isMember(userId)) {
          return callback?.({ error: "Room not found or access denied" });
        }

        const message = await Message.create({
          sender: userId,
          room: roomId,
          content,
          type,
        });

        room.lastMessage = message._id;
        room.updatedAt = new Date();
        await room.save();

        await message.populate("sender", "username avatar isOnline");

        io.to(roomId).emit("message:new", { message, roomId });

        callback?.({ success: true, message });
      } catch (err) {
        logger.error("Socket message:send error:", err);
        callback?.({ error: "Failed to send message" });
      }
    });

    socket.on("message:delete", async (data, callback) => {
      try {
        const { messageId } = data;

        const message = await Message.findById(messageId);
        if (!message) return callback?.({ error: "Message not found" });

        if (message.sender._id.toString() !== userId) {
          return callback?.({ error: "Cannot delete another user's message" });
        }

        await message.markDeleted();

        io.to(message.room.toString()).emit("message:deleted", {
          messageId,
          roomId: message.room.toString(),
        });

        callback?.({ success: true });
      } catch (err) {
        logger.error("Socket message:delete error:", err);
        callback?.({ error: "Failed to delete message" });
      }
    });

    socket.on("message:edit", async (data, callback) => {
      try {
        const { messageId, content } = data;

        const message = await Message.findById(messageId);
        if (!message || message.isDeleted) {
          return callback?.({ error: "Message not found or deleted" });
        }

        if (message.sender._id.toString() !== userId) {
          return callback?.({ error: "Cannot edit another user's message" });
        }

        message.content = content;
        message.editedAt = new Date();
        await message.save();

        io.to(message.room.toString()).emit("message:edited", {
          messageId,
          content,
          editedAt: message.editedAt,
          roomId: message.room.toString(),
        });

        callback?.({ success: true });
      } catch (err) {
        logger.error("Socket message:edit error:", err);
        callback?.({ error: "Failed to edit message" });
      }
    });

    socket.on("typing:start", (data) => {
      const { roomId } = data;
      socket.to(roomId).emit("typing:update", {
        userId,
        username: socket.user.username,
        roomId,
        isTyping: true,
      });
    });

    socket.on("typing:stop", (data) => {
      const { roomId } = data;
      socket.to(roomId).emit("typing:update", {
        userId,
        username: socket.user.username,
        roomId,
        isTyping: false,
      });
    });

    socket.on("room:join", async (data) => {
      const { roomId } = data;
      const room = await Room.findById(roomId);
      if (room && room.isMember(userId)) {
        socket.join(roomId);
      }
    });

    socket.on("room:read", async (data) => {
      try {
        const { roomId } = data;
        const room = await Room.findById(roomId);
        if (!room) return;

        const member = room.members.find((m) => m.user.toString() === userId);
        if (member) {
          member.lastRead = new Date();
          await room.save();
        }

        socket.to(roomId).emit("room:read_update", {
          userId,
          roomId,
          readAt: new Date(),
        });
      } catch (err) {
        logger.error("Socket room:read error:", err);
      }
    });

    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        socketId: null,
        lastSeen: new Date(),
      });

      io.emit("user:online", { userId, isOnline: false });

      logger.info(`User disconnected: ${socket.user.username} (${socket.id})`);
    });
  });
};

export const getOnlineUsers = () => Array.from(onlineUsers.keys());
