import { z } from "zod";

// Schema for creating a character
export const characterCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Character name is required")
    .max(255, "Character name must be less than 255 characters")
    .trim(),
  level: z
    .number()
    .int("Level must be an integer")
    .min(1, "Level must be at least 1")
    .max(100, "Level cannot exceed 100")
    .default(1),
  gender: z.string().min(1, "Gender is required").trim(),
  note: z
    .string()
    .max(1000, "Note must be less than 1000 characters")
    .default("")
    .optional(),
  raceId: z.number().int().positive("Race ID is required"),
  specializationId: z.number().int().positive("Specialization ID is required"),
});
