import { z } from "zod";

// Registration validation
export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100),

  email: z
    .string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  phone: z.string().optional(),
});

// Login validation
export const loginSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;