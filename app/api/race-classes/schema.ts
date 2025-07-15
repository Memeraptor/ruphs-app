import { z } from "zod";

// Schema for creating a new race-class relationship
export const raceClassSchema = z.object({
  raceId: z
    .number()
    .int("Race ID must be an integer")
    .positive("Race ID must be positive"),

  classId: z
    .number()
    .int("Class ID must be an integer")
    .positive("Class ID must be positive"),
});

// Schema for updating a race-class relationship (all fields optional)
export const raceClassUpdateSchema = z.object({
  raceId: z
    .number()
    .int("Race ID must be an integer")
    .positive("Race ID must be positive")
    .optional(),

  classId: z
    .number()
    .int("Class ID must be an integer")
    .positive("Class ID must be positive")
    .optional(),
});

// Schema for query parameters
export const raceClassQuerySchema = z.object({
  includeRace: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  includeClass: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  raceId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  classId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  raceName: z.string().optional(),
  className: z.string().optional(),
  factionId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
});

// Type definitions for TypeScript
export type RaceClassCreateInput = z.infer<typeof raceClassSchema>;
export type RaceClassUpdateInput = z.infer<typeof raceClassUpdateSchema>;
export type RaceClassQueryParams = z.infer<typeof raceClassQuerySchema>;
