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
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.role !== "student") {
      res.status(403).json({
        success: false,
        message: "Only students can apply to become tutors",
      });
      return;
    }

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

    // Uploaded file metadata supplied by the private upload middleware.
    const uploadedFile = (
      req as Request & {
        file?: {
          filename?: string;
        };
      }
    ).file;

    const applicationData = {
      ...req.body,
      studentIdCardImage: uploadedFile?.filename,
    };

    const validation =
      tutorApplicationSchema.safeParse(applicationData);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
      return;
    }

    const tutor = await Tutor.create({
      user: userId,
      ...validation.data,

      applicationStatus: "pending",
      subscriptionStatus: "not_started",
      hasUsedFreeTrial: false,
    });

    res.status(201).json({
      success: true,
      message: "Tutor application submitted successfully",
      data: {
        _id: tutor._id,
        applicationStatus: tutor.applicationStatus,
        subscriptionStatus: tutor.subscriptionStatus,
        createdAt: tutor.createdAt,
      },
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
    const page = Math.max(1, Number(req.query.page) || 1);

    const limit = Math.min(
      50,
      Math.max(1, Number(req.query.limit) || 10)
    );

    const skip = (page - 1) * limit;

    const search = String(req.query.search || "").trim();
    const city = String(req.query.city || "").trim();
    const subject = String(req.query.subject || "").trim();

    const minExperience = Number(req.query.minExperience);
    const maxSalary = Number(req.query.maxSalary);

    const filter: FilterQuery<ITutor> = {
      applicationStatus: "approved",
    };

    if (city) {
      filter.city = {
        $regex: city,
        $options: "i",
      };
    }

    if (subject) {
      filter.subjects = {
        $regex: subject,
        $options: "i",
      };
    }

    if (
      req.query.minExperience !== undefined &&
      Number.isFinite(minExperience)
    ) {
      filter.experience = {
        $gte: Math.max(0, minExperience),
      };
    }

    if (
      req.query.maxSalary !== undefined &&
      Number.isFinite(maxSalary)
    ) {
      filter.expectedSalary = {
        $lte: Math.max(0, maxSalary),
      };
    }

    if (search) {
      const safeSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { bio: { $regex: safeSearch, $options: "i" } },
        { qualifications: { $regex: safeSearch, $options: "i" } },
        { subjects: { $regex: safeSearch, $options: "i" } },
        { city: { $regex: safeSearch, $options: "i" } },
        { area: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const total = await Tutor.countDocuments(filter);

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