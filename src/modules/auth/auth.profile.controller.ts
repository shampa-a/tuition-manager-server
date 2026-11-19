import { Request, Response } from "express";
import User from "../../models/user.model";

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