import mongoose, { Schema, Model } from "mongoose";

export type TutorApplicationStatus =
  | "pending"
  | "approved"
  | "rejected";

export type TutorSubscriptionStatus =
  | "not_started"
  | "trial"
  | "active"
  | "expired";

export interface ITutor {
  user: mongoose.Types.ObjectId;

  bio: string;
  qualifications: string[];
  subjects: string[];
  experience: number;

  city: string;
  area: string;

  expectedSalary: number;

  applicationStatus: TutorApplicationStatus;
  rejectionReason?: string;

  subscriptionStatus: TutorSubscriptionStatus;

  trialStartDate?: Date;
  trialEndDate?: Date;

  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;

  hasUsedFreeTrial: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

const tutorSchema = new Schema<ITutor>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      required: true,
      trim: true,
      minlength: 30,
      maxlength: 1000,
    },

    qualifications: {
      type: [String],
      required: true,
    },

    subjects: {
      type: [String],
      required: true,
    },

    experience: {
      type: Number,
      required: true,
      min: 0,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      required: true,
      trim: true,
    },

    expectedSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    applicationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    subscriptionStatus: {
      type: String,
      enum: ["not_started", "trial", "active", "expired"],
      default: "not_started",
    },

    trialStartDate: Date,

    trialEndDate: Date,

    subscriptionStartDate: Date,

    subscriptionEndDate: Date,

    hasUsedFreeTrial: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Tutor: Model<ITutor> =
  mongoose.models.Tutor ||
  mongoose.model<ITutor>("Tutor", tutorSchema);

export default Tutor;