import { Request, Response } from "express";
import User from "../../models/user.model";

// Get logged-in user's profile
export const getMyProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select(
      "-password"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update logged-in user's profile
export const updateMyProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const { fullName, phone, city, area } = req.body;

    const updates: {
      fullName?: string;
      phone?: string;
      city?: string;
      area?: string;
    } = {};

    if (fullName !== undefined) {
      if (
        typeof fullName !== "string" ||
        fullName.trim().length < 2 ||
        fullName.trim().length > 100
      ) {
        res.status(400).json({
          success: false,
          message: "Name must contain 2 to 100 characters",
        });
        return;
      }

      updates.fullName = fullName.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== "string" || phone.length > 20) {
        res.status(400).json({
          success: false,
          message: "Invalid phone number",
        });
        return;
      }

      updates.phone = phone.trim();
    }

    if (city !== undefined) {
      if (typeof city !== "string" || city.length > 100) {
        res.status(400).json({
          success: false,
          message: "Invalid city",
        });
        return;
      }

      updates.city = city.trim();
    }

    if (area !== undefined) {
      if (typeof area !== "string" || area.length > 100) {
        res.status(400).json({
          success: false,
          message: "Invalid area",
        });
        return;
      }

      updates.area = area.trim();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};