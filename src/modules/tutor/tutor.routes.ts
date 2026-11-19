import { Router } from "express";

import { applyForTutor } from "./tutor.controller";
import { getMySubscription } from "./subscription.controller";

import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

// Apply to become a tutor
router.post(
  "/apply",
  authenticateUser,
  applyForTutor
);

// Get tutor subscription information
router.get(
  "/subscription/me",
  authenticateUser,
  getMySubscription
);

export default router;