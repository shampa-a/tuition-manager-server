import { Router } from "express";

import {
  getPendingTutors,
  getTutorApplicationById,
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

// Get individual tutor application details
router.get("/tutors/:tutorId", getTutorApplicationById);

// Approve tutor
router.patch("/tutors/:tutorId/approve", approveTutor);

// Reject tutor
router.patch("/tutors/:tutorId/reject", rejectTutor);

export default router;