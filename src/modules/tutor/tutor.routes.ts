import { Router } from "express";

import { applyForTutor } from "./tutor.controller";

import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

// Apply to become a tutor
router.post(
  "/apply",
  authenticateUser,
  applyForTutor
);

export default router;