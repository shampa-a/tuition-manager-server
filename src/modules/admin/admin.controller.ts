import { Request, Response } from "express";
import mongoose from "mongoose";

import Tutor from "../../models/tutor.model";
import User from "../../models/user.model";

// ============================================
// GET PENDING TUTOR APPLICATIONS
// ============================================

export const getPendingTutors = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);

    const limit = Math.min(
      50,
      Math.max(1, Number(req.query.limit) || 10)
    );

    const skip = (page - 1) * limit;

    const filter = {
      applicationStatus: "pending",
    };

    const [tutors, total] = await Promise.all([
      Tutor.find(filter)
        .select("-nidNumber -studentIdCardImage")
        .populate("user", "fullName email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Tutor.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Pending tutor applications retrieved successfully",
      data: tutors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get pending tutors error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve tutor applications",
    });
  }
};

// ============================================
// GET SINGLE TUTOR APPLICATION
// ADMIN ONLY
// ============================================

export const getTutorApplicationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tutorId } = req.params;

    if (!mongoose.isValidObjectId(tutorId)) {
      res.status(400).json({
        success: false,
        message: "Invalid tutor ID",
      });
      return;
    }

    const tutor = await Tutor.findById(tutorId)
      .select("+nidNumber +studentIdCardImage")
      .populate("user", "fullName email phone role")
      .lean();

    if (!tutor) {
      res.status(404).json({
        success: false,
        message: "Tutor application not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Tutor application retrieved successfully",
      data: tutor,
    });
  } catch (error) {
    console.error("Get tutor application error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve tutor application",
    });
  }
};

// ============================================
// APPROVE TUTOR APPLICATION
// ACTIVATE ONE-TIME 7-DAY FREE TRIAL
// ============================================

export const approveTutor = async (
  req: Request,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    const { tutorId } = req.params;

    if (!mongoose.isValidObjectId(tutorId)) {
      res.status(400).json({
        success: false,
        message: "Invalid tutor ID",
      });
      return;
    }

    let responseData: Record<string, unknown> | null = null;

    await session.withTransaction(async () => {
      const tutor = await Tutor.findOne({
        _id: tutorId,
        applicationStatus: "pending",
      }).session(session);

      if (!tutor) {
        throw new Error("APPLICATION_NOT_PENDING");
      }

      const user = await User.findById(tutor.user).session(session);

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      const now = new Date();

      let trialEndDate: Date | undefined;

      tutor.applicationStatus = "approved";

      if (!tutor.hasUsedFreeTrial) {
        trialEndDate = new Date(now);
        trialEndDate.setDate(trialEndDate.getDate() + 7);

        tutor.subscriptionStatus = "trial";
        tutor.trialStartDate = now;
        tutor.trialEndDate = trialEndDate;
        tutor.hasUsedFreeTrial = true;
      } else {
        tutor.subscriptionStatus = "not_started";
      }

      user.role = "tutor";

      await tutor.save({ session });
      await user.save({ session });

      responseData = {
        tutorId: tutor._id,
        userId: user._id,
        name: user.fullName,
        role: user.role,
        applicationStatus: tutor.applicationStatus,
        subscriptionStatus: tutor.subscriptionStatus,
        trialStartDate: tutor.trialStartDate,
        trialEndDate: tutor.trialEndDate,
        hasUsedFreeTrial: tutor.hasUsedFreeTrial,
      };
    });

    res.status(200).json({
      success: true,
      message: "Tutor approved successfully",
      data: responseData,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "APPLICATION_NOT_PENDING"
    ) {
      res.status(409).json({
        success: false,
        message: "This application has already been processed",
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === "USER_NOT_FOUND"
    ) {
      res.status(404).json({
        success: false,
        message: "Associated user not found",
      });
      return;
    }

    console.error("Approve tutor error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to approve tutor application",
    });
  } finally {
    await session.endSession();
  }
};

// ============================================
// REJECT TUTOR APPLICATION
// ============================================

export const rejectTutor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tutorId } = req.params;
    const { reason } = req.body;

    if (!mongoose.isValidObjectId(tutorId)) {
      res.status(400).json({
        success: false,
        message: "Invalid tutor ID",
      });
      return;
    }

    if (
      typeof reason !== "string" ||
      !reason.trim() ||
      reason.trim().length > 500
    ) {
      res.status(400).json({
        success: false,
        message: "A rejection reason is required (maximum 500 characters)",
      });
      return;
    }

    const tutor = await Tutor.findOneAndUpdate(
      {
        _id: tutorId,
        applicationStatus: "pending",
      },
      {
        $set: {
          applicationStatus: "rejected",
          rejectionReason: reason.trim(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!tutor) {
      const exists = await Tutor.exists({ _id: tutorId });

      res.status(exists ? 409 : 404).json({
        success: false,
        message: exists
          ? "This application has already been processed"
          : "Tutor application not found",
      });

      return;
    }

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
      message: "Failed to reject tutor application",
    });
  }
};