import { Router } from "express";

import {
  registerUser,
  loginUser,
} from "./auth.controller";

import { authenticateUser } from "../../middlewares/auth.middleware";

import {
  getMyProfile,
  updateMyProfile,
} from "./auth.profile.controller";

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", authenticateUser, getMyProfile);
router.patch("/me", authenticateUser, updateMyProfile);

export default router;