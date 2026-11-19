import mongoose, { Schema, Model } from "mongoose";

export type UserRole = "student" | "tutor" | "admin";

export type AccountStatus = "active" | "suspended";

export interface IUser {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  isEmailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
      default: "student",
    },

    accountStatus: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;