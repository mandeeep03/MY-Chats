import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  getMessages,
  sendMessage,
  deleteMessage,
  editMessage,
  searchMessages,
} from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router({ mergeParams: true });

router.use(protect);

router.get(
  "/",
  [param("roomId").isMongoId().withMessage("Invalid room ID")],
  validate,
  getMessages
);

router.get(
  "/search",
  [
    param("roomId").isMongoId().withMessage("Invalid room ID"),
    query("q").trim().notEmpty().withMessage("Search query is required"),
  ],
  validate,
  searchMessages
);

router.post(
  "/",
  [
    param("roomId").isMongoId().withMessage("Invalid room ID"),
    body("content")
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage("Message must be between 1 and 2000 characters"),
  ],
  validate,
  sendMessage
);

router.patch(
  "/:messageId",
  [
    param("messageId").isMongoId().withMessage("Invalid message ID"),
    body("content")
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage("Message content is required"),
  ],
  validate,
  editMessage
);

router.delete(
  "/:messageId",
  [param("messageId").isMongoId().withMessage("Invalid message ID")],
  validate,
  deleteMessage
);

export default router;
