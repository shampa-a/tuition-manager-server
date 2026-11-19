import { Request, Response } from "express";

import Tutor from "../../models/tutor.model";
import User from "../../models/user.model";

import { tutorApplicationSchema } from "../../validators/tutor.validator";

export const applyForTutor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check authenticated user
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Only students can apply
    if (user.role !== "student") {
      res.status(403).json({
        success: false,
        message: "Only students can apply to become tutors",
      });
      return;
    }

    // Validate application
    const validation = tutorApplicationSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
      return;
    }

    // Check previous application
    const existingApplication = await Tutor.findOne({
      user: userId,
    });

    if (existingApplication) {
      res.status(409).json({
        success: false,
        message: "You have already submitted a tutor application",
      });
      return;
    }

    // Create tutor application
    const tutor = await Tutor.create({
      user: userId,
      ...validation.data,

      applicationStatus: "pending",

      // Trial starts only after admin approval
      subscriptionStatus: "not_started",

      hasUsedFreeTrial: false,
    });

    res.status(201).json({
      success: true,
      message: "Tutor application submitted successfully",
      data: tutor,
    });
  } catch (error) {
    console.error("Tutor application error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};