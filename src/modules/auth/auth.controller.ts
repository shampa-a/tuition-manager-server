import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../../models/user.model";
import {
  registerSchema,
  loginSchema,
} from "../../validators/auth.validator";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
      return;
    }

    const { fullName, email, password, phone } = validation.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Email already registered",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role: "student",
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate login data
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
      return;
    }

    const { email, password } = validation.data;

    // Find user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check account status
    if (user.accountStatus !== "active") {
      res.status(403).json({
        success: false,
        message: "Your account has been suspended",
      });
      return;
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is missing in .env");
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: "7d",
      }
    );

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};