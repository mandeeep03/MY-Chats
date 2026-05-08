import User from "../models/User.js";
import { signToken } from "../utils/token.js";
import { sendSuccess, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.create({ username, email, password });

    const token = signToken({ id: user._id });

    logger.info(`New user registered: ${user.email}`);

    return sendSuccess(
      res,
      { token, user: user.toPublicJSON() },
      "Registration successful",
      201
    );
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, "Invalid email or password", 401);
    }

    const token = signToken({ id: user._id });

    logger.info(`User logged in: ${user.email}`);

    return sendSuccess(res, { token, user: user.toPublicJSON() }, "Login successful");
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, { user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { bio, avatar } = req.body;

    const allowed = {};
    if (bio !== undefined) allowed.bio = bio;
    if (avatar !== undefined) allowed.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, allowed, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, { user: user.toPublicJSON() }, "Profile updated");
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.comparePassword(currentPassword))) {
      return sendError(res, "Current password is incorrect", 400);
    }

    user.password = newPassword;
    await user.save();

    const token = signToken({ id: user._id });

    return sendSuccess(res, { token }, "Password changed successfully");
  } catch (err) {
    next(err);
  }
};
