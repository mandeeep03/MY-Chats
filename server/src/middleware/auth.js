import { extractTokenFromHeader, verifyToken } from "../utils/token.js";
import { sendError } from "../utils/response.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return sendError(res, "You are not logged in. Please log in to access this.", 401);
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return sendError(res, "The user belonging to this token no longer exists.", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return sendError(res, "Invalid token. Please log in again.", 401);
    }
    if (err.name === "TokenExpiredError") {
      return sendError(res, "Your token has expired. Please log in again.", 401);
    }
    next(err);
  }
};
