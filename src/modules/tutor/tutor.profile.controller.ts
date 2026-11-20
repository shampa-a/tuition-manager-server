import { Request, Response } from "express";
import Tutor from "../../models/tutor.model";

// Get logged-in tutor's profile
export const getMyTutorProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tutor = await Tutor.findOne({
      user: req.user?.userId,
      applicationStatus: "approved",
    }).populate("user", "fullName email phone");

    if (!tutor) {
      res.status(404).json({
        success: false,
        message: "Approved tutor profile not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Tutor profile retrieved successfully",
      data: tutor,
    });
  } catch (error) {
    console.error("Tutor profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve tutor profile",
    });
  }
};

// Update logged-in tutor's teaching profile
export const updateMyTutorProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const {
      bio,
      qualifications,
      subjects,
      experience,
      city,
      area,
      expectedSalary,
    } = req.body;

    const tutor = await Tutor.findOne({
      user: userId,
      applicationStatus: "approved",
    });

    if (!tutor) {
      res.status(404).json({
        success: false,
        message: "Approved tutor profile not found",
      });
      return;
    }

    if (bio !== undefined) {
      if (
        typeof bio !== "string" ||
        bio.trim().length < 30 ||
        bio.trim().length > 1000
      ) {
        res.status(400).json({
          success: false,
          message: "Bio must contain 30 to 1000 characters",
        });
        return;
      }

      tutor.bio = bio.trim();
    }

    if (qualifications !== undefined) {
      if (
        !Array.isArray(qualifications) ||
        qualifications.length === 0 ||
        !qualifications.every(
          (item: unknown) =>
            typeof item === "string" && item.trim().length > 0
        )
      ) {
        res.status(400).json({
          success: false,
          message: "Please provide valid qualifications",
        });
        return;
      }

      tutor.qualifications = qualifications.map(
        (item: string) => item.trim()
      );
    }

    if (subjects !== undefined) {
      if (
        !Array.isArray(subjects) ||
        subjects.length === 0 ||
        !subjects.every(
          (item: unknown) =>
            typeof item === "string" && item.trim().length > 0
        )
      ) {
        res.status(400).json({
          success: false,
          message: "Please provide valid subjects",
        });
        return;
      }

      tutor.subjects = subjects.map(
        (item: string) => item.trim()
      );
    }

    if (experience !== undefined) {
      if (
        typeof experience !== "number" ||
        !Number.isFinite(experience) ||
        experience < 0
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid teaching experience",
        });
        return;
      }

      tutor.experience = experience;
    }

    if (city !== undefined) {
      if (typeof city !== "string" || !city.trim()) {
        res.status(400).json({
          success: false,
          message: "City is required",
        });
        return;
      }

      tutor.city = city.trim();
    }

    if (area !== undefined) {
      if (typeof area !== "string" || !area.trim()) {
        res.status(400).json({
          success: false,
          message: "Area is required",
        });
        return;
      }

      tutor.area = area.trim();
    }

    if (expectedSalary !== undefined) {
      if (
        typeof expectedSalary !== "number" ||
        !Number.isFinite(expectedSalary) ||
        expectedSalary < 0
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid expected salary",
        });
        return;
      }

      tutor.expectedSalary = expectedSalary;
    }

    await tutor.save();

    await tutor.populate("user", "fullName email phone");

    res.status(200).json({
      success: true,
      message: "Tutor profile updated successfully",
      data: tutor,
    });
  } catch (error) {
    console.error("Update tutor profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update tutor profile",
    });
  }
};