import { z } from "zod";

// Convert FormData array strings into arrays.
// The frontend will send arrays using JSON.stringify().
const parseArray = (value: unknown) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
};

// Convert FormData boolean strings into booleans.
const parseBoolean = (value: unknown) => {
  if (value === "true") return true;
  if (value === "false") return false;

  return value;
};

// Convert FormData number strings into numbers.
const parseNumber = (value: unknown) => {
  if (value === "" || value === undefined) {
    return undefined;
  }

  return Number(value);
};

export const tutorApplicationSchema = z
  .object({
    bio: z
      .string()
      .min(30, "Bio must be at least 30 characters")
      .max(1000, "Bio cannot exceed 1000 characters"),

    qualifications: z.preprocess(
      parseArray,
      z.array(z.string().min(2)).min(
        1,
        "At least one qualification is required"
      )
    ),

    subjects: z.preprocess(
      parseArray,
      z.array(z.string().min(2)).min(
        1,
        "At least one subject is required"
      )
    ),

    experience: z.preprocess(
      parseNumber,
      z.number().min(0, "Experience cannot be negative")
    ),

    city: z.string().min(2, "City is required"),

    area: z.string().min(2, "Area is required"),

    expectedSalary: z.preprocess(
      parseNumber,
      z.number().min(0, "Expected salary cannot be negative")
    ),

    // Bangladesh NID: 10, 13, or 17 digits.
    nidNumber: z
      .string()
      .trim()
      .regex(
        /^(?:\d{10}|\d{13}|\d{17})$/,
        "Enter a valid 10, 13, or 17 digit NID number"
      ),

    isCurrentlyStudent: z.preprocess(
      parseBoolean,
      z.boolean()
    ),

    studentIdCardImage: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.isCurrentlyStudent &&
      !data.studentIdCardImage
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["studentIdCardImage"],
        message: "Student ID card image is required",
      });
    }
  });

export type TutorApplicationInput = z.infer<
  typeof tutorApplicationSchema
>;