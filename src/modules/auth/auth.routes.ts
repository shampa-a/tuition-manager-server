import { Router } from "express";

import {
  registerUser,
  loginUser,
} from "./auth.controller";

import { getMyProfile } from "./auth.profile.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", authenticateUser, getMyProfile);

export default router;