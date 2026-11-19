import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../models/user.model";

interface JwtPayload {
  userId: string;
  role: UserRole;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is missing");
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Attach user information to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};