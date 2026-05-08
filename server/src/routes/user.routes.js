import { Router } from "express";
import { param, query } from "express-validator";
import { searchUsers, getUserById } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);

router.get(
  "/search",
  [query("q").trim().notEmpty().withMessage("Search query is required")],
  validate,
  searchUsers
);

router.get(
  "/:userId",
  [param("userId").isMongoId().withMessage("Invalid user ID")],
  validate,
  getUserById
);

export default router;
