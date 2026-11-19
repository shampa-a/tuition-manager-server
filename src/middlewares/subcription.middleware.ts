import { Request, Response, NextFunction } from "express";
import Tutor from "../models/tutor.model";

export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
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

    // Only tutors can access paid tutor features
    if (req.user?.role !== "tutor") {
      res.status(403).json({
        success: false,
        message: "This feature is available only to tutors",
      });
      return;
    }

    const tutor = await Tutor.findOne({ user: userId });

    if (!tutor || tutor.applicationStatus !== "approved") {
      res.status(403).json({
        success: false,
        message: "Your tutor profile is not approved",
      });
      return;
    }

    const now = new Date();

    // Check free trial expiration
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

    // Check subscription access
    if (
      tutor.subscriptionStatus !== "trial" &&
      tutor.subscriptionStatus !== "active"
    ) {
      res.status(403).json({
        success: false,
        message: "Your free trial or subscription has expired. Please subscribe for ৳500 to continue.",
        data: {
          subscriptionStatus: tutor.subscriptionStatus,
          monthlyPrice: 500,
        },
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Subscription middleware error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};