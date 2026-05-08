import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage("Username must be between 3 and 20 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers and underscores"),
    body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

router.use(protect);

router.get("/me", getMe);

router.patch(
  "/profile",
  [
    body("bio")
      .optional()
      .isLength({ max: 150 })
      .withMessage("Bio cannot exceed 150 characters"),
    body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),
  ],
  validate,
  updateProfile
);

router.patch(
  "/password",
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  validate,
  changePassword
);

export default router;
