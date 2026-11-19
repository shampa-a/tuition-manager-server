import { Request, Response } from "express";

import Tutor from "../../models/tutor.model";
import User from "../../models/user.model";

// Get all pending tutor applications
export const getPendingTutors = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tutors = await Tutor.find({
      applicationStatus: "pending",
    })
      .populate("user", "fullName email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Pending tutor applications retrieved successfully",
      total: tutors.length,
      data: tutors,
    });
  } catch (error) {
    console.error("Get pending tutors error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Approve tutor application
export const approveTutor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tutorId } = req.params;

    const tutor = await Tutor.findById(tutorId);

    if (!tutor) {
      res.status(404).json({
        success: false,
        message: "Tutor application not found",
      });
      return;
    }

    if (tutor.applicationStatus !== "pending") {
      res.status(400).json({
        success: false,
        message: "This application has already been processed",
      });
      return;
    }

    const user = await User.findById(tutor.user);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Associated user not found",
      });
      return;
    }

    // Calculate 7-day free trial
    const now = new Date();

    tutor.applicationStatus = "approved";

    if (!tutor.hasUsedFreeTrial) {
      const trialEndDate = new Date(now);
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      tutor.subscriptionStatus = "trial";
      tutor.trialStartDate = now;
      tutor.trialEndDate = trialEndDate;
      tutor.hasUsedFreeTrial = true;
    } else {
      // No second free trial
      tutor.subscriptionStatus = "not_started";
    }

    // Change user role to tutor
    user.role = "tutor";

    await tutor.save();
    await user.save();

    res.status(200).json({
      success: true,
      message: tutor.hasUsedFreeTrial
        ? "Tutor approved successfully"
        : "Tutor approved successfully",
      data: {
        tutorId: tutor._id,
        userId: user._id,
        name: user.fullName,
        role: user.role,
        applicationStatus: tutor.applicationStatus,
        subscriptionStatus: tutor.subscriptionStatus,
        trialStartDate: tutor.trialStartDate,
        trialEndDate: tutor.trialEndDate,
      },
    });
  } catch (error) {
    console.error("Approve tutor error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reject tutor application
export const rejectTutor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tutorId } = req.params;
    const { reason } = req.body;

    if (!reason || typeof reason !== "string" || !reason.trim()) {
      res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
      return;
    }

    const tutor = await Tutor.findById(tutorId);

    if (!tutor) {
      res.status(404).json({
        success: false,
        message: "Tutor application not found",
      });
      return;
    }

    if (tutor.applicationStatus !== "pending") {
      res.status(400).json({
        success: false,
        message: "This application has already been processed",
      });
      return;
    }

    tutor.applicationStatus = "rejected";
    tutor.rejectionReason = reason.trim();

    await tutor.save();

    res.status(200).json({
      success: true,
      message: "Tutor application rejected successfully",
      data: {
        tutorId: tutor._id,
        applicationStatus: tutor.applicationStatus,
        rejectionReason: tutor.rejectionReason,
      },
    });
  } catch (error) {
    console.error("Reject tutor error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};