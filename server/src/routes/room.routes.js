import { Router } from "express";
import { body, param } from "express-validator";
import {
  getMyRooms,
  createDirectRoom,
  createGroupRoom,
  getRoomById,
  addMember,
  leaveRoom,
} from "../controllers/room.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);

router.get("/", getMyRooms);

router.post(
  "/direct",
  [body("userId").isMongoId().withMessage("Invalid user ID")],
  validate,
  createDirectRoom
);

router.post(
  "/group",
  [
    body("name").trim().isLength({ min: 1, max: 50 }).withMessage("Group name is required"),
    body("memberIds")
      .isArray({ min: 2 })
      .withMessage("At least 2 members are required"),
    body("memberIds.*").isMongoId().withMessage("Invalid member ID"),
  ],
  validate,
  createGroupRoom
);

router.get(
  "/:roomId",
  [param("roomId").isMongoId().withMessage("Invalid room ID")],
  validate,
  getRoomById
);

router.post(
  "/:roomId/members",
  [
    param("roomId").isMongoId().withMessage("Invalid room ID"),
    body("userId").isMongoId().withMessage("Invalid user ID"),
  ],
  validate,
  addMember
);

router.delete(
  "/:roomId/leave",
  [param("roomId").isMongoId().withMessage("Invalid room ID")],
  validate,
  leaveRoom
);

export default router;
