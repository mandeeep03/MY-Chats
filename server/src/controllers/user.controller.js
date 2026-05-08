import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return sendError(res, "Search query must be at least 2 characters", 400);
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q.trim(), $options: "i" } },
        { email: { $regex: q.trim(), $options: "i" } },
      ],
      _id: { $ne: req.user._id },
    })
      .select("username avatar isOnline lastSeen bio")
      .limit(10);

    return sendSuccess(res, { users });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "username avatar isOnline lastSeen bio createdAt"
    );

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};
