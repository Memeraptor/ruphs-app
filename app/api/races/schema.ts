import { z } from "zod";

// Schema for creating a new race
export const raceSchema = z.object({
  name: z
    .string()
    .min(1, "Race name is required")
    .max(255, "Race name must be less than 255 characters")
    .trim(),

  slug: z
    .string()
    .min(1, "Race slug is required")
    .max(255, "Race slug must be less than 255 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    )
    .trim(),

  factionId: z
    .number()
    .int("Faction ID must be an integer")
    .positive("Faction ID must be positive"),
});

// Schema for updating a race (all fields optional)
export const raceUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Race name is required")
    .max(255, "Race name must be less than 255 characters")
    .trim()
    .optional(),

  slug: z
    .string()
    .min(1, "Race slug is required")
    .max(255, "Race slug must be less than 255 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    )
    .trim()
    .optional(),

  factionId: z
    .number()
    .int("Faction ID must be an integer")
    .positive("Faction ID must be positive")
    .optional(),
});

// Schema for query parameters
export const raceQuerySchema = z.object({
  includeFaction: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  includeClasses: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  includeCharacters: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  factionId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
});

// Type definitions for TypeScript
export type RaceCreateInput = z.infer<typeof raceSchema>;
export type RaceUpdateInput = z.infer<typeof raceUpdateSchema>;
export type RaceQueryParams = z.infer<typeof raceQuerySchema>;
