import { z } from "zod";

// Schema for creating a new class
export const classSchema = z.object({
  name: z
    .string()
    .min(1, "Class name is required")
    .max(255, "Class name must be less than 255 characters")
    .trim(),

  slug: z
    .string()
    .min(1, "Class slug is required")
    .max(255, "Class slug must be less than 255 characters")
    .regex(
      /^[a-z][a-zA-Z0-9]*$/,
      "Slug must be in camelCase format (start with lowercase letter, followed by letters and numbers only)"
    )
    .trim(),

  armorType: z
    .string()
    .max(255, "Armor type must be less than 255 characters")
    .trim()
    .default(""),

  colorCode: z
    .string()
    .max(255, "Color code must be less than 255 characters")
    .regex(
      /^#[0-9A-Fa-f]{6}$|^$/,
      "Color code must be a valid hex color (e.g., #FF0000) or empty"
    )
    .trim()
    .default(""),
});

// Schema for updating a class (all fields optional)
export const classUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Class name is required")
    .max(255, "Class name must be less than 255 characters")
    .trim()
    .optional(),

  slug: z
    .string()
    .min(1, "Class slug is required")
    .max(255, "Class slug must be less than 255 characters")
    .regex(
      /^[a-z][a-zA-Z0-9]*$/,
      "Slug must be in camelCase format (start with lowercase letter, followed by letters and numbers only)"
    )
    .trim()
    .optional(),

  armorType: z
    .string()
    .max(255, "Armor type must be less than 255 characters")
    .trim()
    .optional(),

  colorCode: z
    .string()
    .max(255, "Color code must be less than 255 characters")
    .regex(
      /^#[0-9A-Fa-f]{6}$|^$/,
      "Color code must be a valid hex color (e.g., #FF0000) or empty"
    )
    .trim()
    .optional(),
});

// Schema for query parameters
export const classQuerySchema = z.object({
  includeRaces: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  includeSpecializations: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  armorType: z.string().optional(),
});

// Type definitions for TypeScript
export type ClassCreateInput = z.infer<typeof classSchema>;
export type ClassUpdateInput = z.infer<typeof classUpdateSchema>;
export type ClassQueryParams = z.infer<typeof classQuerySchema>;
