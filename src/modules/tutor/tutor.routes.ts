import { Router } from "express";
import {
  getMyTutorProfile,
  updateMyTutorProfile,
} from "./tutor.profile.controller";

import {
  applyForTutor,
  getApprovedTutors,
} from "./tutor.controller";

import { getMySubscription } from "./subscription.controller";
import { createSubscriptionPayment } from "./payment.controller";

import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

router.get(
  "/profile/me",
  authenticateUser,
  getMyTutorProfile
);

router.patch(
  "/profile/me",
  authenticateUser,
  updateMyTutorProfile
);

// Public tutor directory
router.get("/", getApprovedTutors);

// Tutor application
router.post("/apply", authenticateUser, applyForTutor);

// Subscription
router.get(
  "/subscription/me",
  authenticateUser,
  getMySubscription
);

// Subscription payment
router.post(
  "/subscription/payment",
  authenticateUser,
  createSubscriptionPayment
);

export default router;