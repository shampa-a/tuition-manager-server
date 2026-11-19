import { Router } from "express";

import { applyForTutor } from "./tutor.controller";
import { getMySubscription } from "./subscription.controller";
import { createSubscriptionPayment } from "./payment.controller";

import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/apply", authenticateUser, applyForTutor);

router.get(
  "/subscription/me",
  authenticateUser,
  getMySubscription
);

router.post(
  "/subscription/payment",
  authenticateUser,
  createSubscriptionPayment
);

export default router;