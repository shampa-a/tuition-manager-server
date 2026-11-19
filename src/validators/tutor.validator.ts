import { z } from "zod";

export const tutorApplicationSchema = z.object({
  bio: z
    .string()
    .min(30, "Bio must be at least 30 characters")
    .max(1000),

  qualifications: z
    .array(z.string().min(2))
    .min(1, "At least one qualification is required"),

  subjects: z
    .array(z.string().min(2))
    .min(1, "At least one subject is required"),

  experience: z
    .number()
    .min(0, "Experience cannot be negative"),

  city: z
    .string()
    .min(2, "City is required"),

  area: z
    .string()
    .min(2, "Area is required"),

  expectedSalary: z
    .number()
    .min(0, "Expected salary cannot be negative"),
});

export type TutorApplicationInput = z.infer<
  typeof tutorApplicationSchema
>;