import { Router } from "express";

import {
  getPendingTutors,
  approveTutor,
  rejectTutor,
} from "./admin.controller";

import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";

const router = Router();

// All admin routes require admin authentication
router.use(authenticateUser, authorizeRoles("admin"));

// Get pending tutor applications
router.get("/tutors/pending", getPendingTutors);

// Approve tutor
router.patch("/tutors/:tutorId/approve", approveTutor);

// Reject tutor
router.patch("/tutors/:tutorId/reject", rejectTutor);

export default router;