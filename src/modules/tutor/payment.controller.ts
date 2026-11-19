import { Request, Response } from "express";
import crypto from "crypto";

import Tutor from "../../models/tutor.model";
import Payment from "../../models/payment.model";

export const createSubscriptionPayment = async (
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
    });

    if (!tutor || tutor.applicationStatus !== "approved") {
      res.status(403).json({
        success: false,
        message: "Approved tutor profile required",
      });
      return;
    }

    const now = new Date();

    // Check existing trial expiration
    if (
      tutor.subscriptionStatus === "trial" &&
      tutor.trialEndDate &&
      now >= tutor.trialEndDate
    ) {
      tutor.subscriptionStatus = "expired";
    }

    // Check existing paid subscription expiration
    if (
      tutor.subscriptionStatus === "active" &&
      tutor.subscriptionEndDate &&
      now >= tutor.subscriptionEndDate
    ) {
      tutor.subscriptionStatus = "expired";
    }

    if (
      tutor.subscriptionStatus === "trial" ||
      tutor.subscriptionStatus === "active"
    ) {
      res.status(400).json({
        success: false,
        message: "Your subscription is already active",
      });
      return;
    }

    await tutor.save();

    // Generate unique transaction ID
    const transactionId = `TM-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")}`;

    // Create pending payment
    const payment = await Payment.create({
      user: userId,
      tutor: tutor._id,
      amount: 500,
      currency: "BDT",
      transactionId,
      paymentStatus: "pending",
      subscriptionDuration: 30,
    });

    res.status(201).json({
      success: true,
      message: "Subscription payment initialized",
      data: {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
        subscriptionDuration: payment.subscriptionDuration,
        paymentStatus: payment.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};