import { Request, Response } from "express";
import { FilterQuery } from "mongoose";

import Tutor, { ITutor } from "../../models/tutor.model";
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

export const getApprovedTutors = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Pagination
    const page = Math.max(1, Number(req.query.page) || 1);

    const limit = Math.min(
      50,
      Math.max(1, Number(req.query.limit) || 10)
    );

    const skip = (page - 1) * limit;

    // Search and filter parameters
    const search = String(req.query.search || "").trim();
    const city = String(req.query.city || "").trim();
    const subject = String(req.query.subject || "").trim();

    const minExperience = Number(req.query.minExperience);
    const maxSalary = Number(req.query.maxSalary);

    // Only approved tutors
    const filter: FilterQuery<ITutor> = {
      applicationStatus: "approved",
    };

    // Filter by city
    if (city) {
      filter.city = {
        $regex: city,
        $options: "i",
      };
    }

    // Filter by subject
    if (subject) {
      filter.subjects = {
        $regex: subject,
        $options: "i",
      };
    }

    // Filter by minimum experience
    if (
      req.query.minExperience !== undefined &&
      Number.isFinite(minExperience)
    ) {
      filter.experience = {
        $gte: Math.max(0, minExperience),
      };
    }

    // Filter by maximum monthly salary
    if (
      req.query.maxSalary !== undefined &&
      Number.isFinite(maxSalary)
    ) {
      filter.expectedSalary = {
        $lte: Math.max(0, maxSalary),
      };
    }

    // Search by tutor information
    if (search) {
      const safeSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        {
          bio: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          qualifications: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          subjects: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          city: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          area: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    // Get total matching tutors
    const total = await Tutor.countDocuments(filter);

    // Retrieve approved tutors
    const tutors = await Tutor.find(filter)
      .select(
        "bio qualifications subjects experience city area expectedSalary createdAt user"
      )
      .populate({
        path: "user",
        select: "fullName",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      message: "Approved tutors retrieved successfully",
      data: tutors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get approved tutors error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve tutors",
    });
  }
};