import Room from "../models/Room.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getMyRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({
      "members.user": req.user._id,
      isActive: true,
    })
      .populate("members.user", "username avatar isOnline lastSeen")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username" },
      })
      .sort({ updatedAt: -1 });

    return sendSuccess(res, { rooms });
  } catch (err) {
    next(err);
  }
};

export const createDirectRoom = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (userId === req.user._id.toString()) {
      return sendError(res, "You cannot create a direct message with yourself", 400);
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return sendError(res, "User not found", 404);
    }

    const { room, created } = await Room.findOrCreateDirect(req.user._id, userId);

    return sendSuccess(
      res,
      { room },
      created ? "Conversation started" : "Existing conversation found",
      created ? 201 : 200
    );
  } catch (err) {
    next(err);
  }
};

export const createGroupRoom = async (req, res, next) => {
  try {
    const { name, memberIds, description } = req.body;

    if (!memberIds || memberIds.length < 2) {
      return sendError(res, "A group needs at least 2 other members", 400);
    }

    const allIds = [...new Set([req.user._id.toString(), ...memberIds])];

    const users = await User.find({ _id: { $in: allIds } });
    if (users.length !== allIds.length) {
      return sendError(res, "One or more users not found", 404);
    }

    const members = allIds.map((id) => ({
      user: id,
      role: id === req.user._id.toString() ? "admin" : "member",
    }));

    const room = await Room.create({ name, type: "group", members, description });
    await room.populate("members.user", "username avatar isOnline lastSeen");

    return sendSuccess(res, { room }, "Group created", 201);
  } catch (err) {
    next(err);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.roomId).populate(
      "members.user",
      "username avatar isOnline lastSeen bio"
    );

    if (!room || !room.isActive) {
      return sendError(res, "Room not found", 404);
    }

    if (!room.isMember(req.user._id)) {
      return sendError(res, "You are not a member of this room", 403);
    }

    return sendSuccess(res, { room });
  } catch (err) {
    next(err);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const room = await Room.findById(req.params.roomId);

    if (!room || room.type !== "group") {
      return sendError(res, "Group room not found", 404);
    }

    if (!room.isAdmin(req.user._id)) {
      return sendError(res, "Only admins can add members", 403);
    }

    if (room.isMember(userId)) {
      return sendError(res, "User is already a member", 400);
    }

    room.members.push({ user: userId, role: "member" });
    await room.save();
    await room.populate("members.user", "username avatar isOnline lastSeen");

    return sendSuccess(res, { room }, "Member added");
  } catch (err) {
    next(err);
  }
};

export const leaveRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room || !room.isMember(req.user._id)) {
      return sendError(res, "Room not found or you are not a member", 404);
    }

    if (room.type === "direct") {
      return sendError(res, "Cannot leave a direct message conversation", 400);
    }

    room.members = room.members.filter(
      (m) => m.user.toString() !== req.user._id.toString()
    );

    if (room.members.length === 0) {
      room.isActive = false;
    } else if (room.isAdmin(req.user._id) && room.members.length > 0) {
      room.members[0].role = "admin";
    }

    await room.save();

    return sendSuccess(res, {}, "Left the room");
  } catch (err) {
    next(err);
  }
};
