import Message from "../models/Message.js";
import Room from "../models/Room.js";
import { sendSuccess, sendError } from "../utils/response.js";

const PAGE_SIZE = 30;

export const getMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { page = 1, before } = req.query;

    const room = await Room.findById(roomId);
    if (!room || !room.isMember(req.user._id)) {
      return sendError(res, "Room not found or access denied", 403);
    }

    const filter = { room: roomId };
    if (before) {
      filter.createdAt = { $lt: new Date(before) };
    }

    const total = await Message.countDocuments(filter);
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    const memberEntry = room.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (memberEntry) {
      memberEntry.lastRead = new Date();
      await room.save();
    }

    return sendSuccess(res, {
      messages: messages.reverse(),
      pagination: {
        page: Number(page),
        pageSize: PAGE_SIZE,
        total,
        hasMore: total > page * PAGE_SIZE,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { content, type = "text" } = req.body;

    const room = await Room.findById(roomId);
    if (!room || !room.isMember(req.user._id)) {
      return sendError(res, "Room not found or access denied", 403);
    }

    const message = await Message.create({
      sender: req.user._id,
      room: roomId,
      content,
      type,
    });

    room.lastMessage = message._id;
    room.updatedAt = new Date();
    await room.save();

    await message.populate("sender", "username avatar isOnline");

    return sendSuccess(res, { message }, "Message sent", 201);
  } catch (err) {
    next(err);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return sendError(res, "Message not found", 404);
    }

    if (message.sender._id.toString() !== req.user._id.toString()) {
      return sendError(res, "You can only delete your own messages", 403);
    }

    if (message.isDeleted) {
      return sendError(res, "Message already deleted", 400);
    }

    await message.markDeleted();

    return sendSuccess(res, { message }, "Message deleted");
  } catch (err) {
    next(err);
  }
};

export const editMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return sendError(res, "Message not found", 404);
    }

    if (message.sender._id.toString() !== req.user._id.toString()) {
      return sendError(res, "You can only edit your own messages", 403);
    }

    if (message.isDeleted) {
      return sendError(res, "Cannot edit a deleted message", 400);
    }

    message.content = content;
    message.editedAt = new Date();
    await message.save();

    return sendSuccess(res, { message }, "Message updated");
  } catch (err) {
    next(err);
  }
};

export const searchMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return sendError(res, "Search query must be at least 2 characters", 400);
    }

    const room = await Room.findById(roomId);
    if (!room || !room.isMember(req.user._id)) {
      return sendError(res, "Room not found or access denied", 403);
    }

    const messages = await Message.find({
      room: roomId,
      isDeleted: false,
      content: { $regex: q.trim(), $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return sendSuccess(res, { messages, query: q });
  } catch (err) {
    next(err);
  }
};
