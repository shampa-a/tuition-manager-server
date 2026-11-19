import { Request, Response } from "express";
import Tutor from "../../models/tutor.model";

export const getMySubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const tutor = await Tutor.findOne({
      user: userId,
    }).select(
      "applicationStatus subscriptionStatus trialStartDate trialEndDate subscriptionStartDate subscriptionEndDate hasUsedFreeTrial"
    );

    if (!tutor) {
      res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
      return;
    }

    const now = new Date();

    // Check trial expiration
    if (
      tutor.subscriptionStatus === "trial" &&
      tutor.trialEndDate &&
      now >= tutor.trialEndDate
    ) {
      tutor.subscriptionStatus = "expired";
      await tutor.save();
    }

    // Check paid subscription expiration
    if (
      tutor.subscriptionStatus === "active" &&
      tutor.subscriptionEndDate &&
      now >= tutor.subscriptionEndDate
    ) {
      tutor.subscriptionStatus = "expired";
      await tutor.save();
    }

    res.status(200).json({
      success: true,
      message: "Subscription information retrieved successfully",
      data: {
        applicationStatus: tutor.applicationStatus,
        subscriptionStatus: tutor.subscriptionStatus,
        monthlyPrice: 500,
        trialStartDate: tutor.trialStartDate,
        trialEndDate: tutor.trialEndDate,
        subscriptionStartDate: tutor.subscriptionStartDate,
        subscriptionEndDate: tutor.subscriptionEndDate,
        hasUsedFreeTrial: tutor.hasUsedFreeTrial,
      },
    });
  } catch (error) {
    console.error("Get subscription error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};