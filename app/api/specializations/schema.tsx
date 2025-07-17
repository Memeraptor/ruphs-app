import { z } from "zod";

// Specialization Zod Schema
export const SpecializationSchema = z.object({
  id: z.number().int().positive().optional(), // Optional for creation
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255, "Slug must be less than 255 characters"),
  classId: z.number().int().positive("Class ID must be a positive integer"),
});

// Schema for creating a new specialization (without id)
export const CreateSpecializationSchema = SpecializationSchema.omit({
  id: true,
});

// Schema for bulk creation of specializations (multiple specs for one class)
export const BulkCreateSpecializationSchema = z.object({
  classId: z.number().int().positive("Class ID must be a positive integer"),
  specializations: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, "Name is required")
          .max(255, "Name must be less than 255 characters"),
        slug: z
          .string()
          .min(1, "Slug is required")
          .max(255, "Slug must be less than 255 characters"),
      })
    )
    .min(1, "At least one specialization is required"),
});

// Type exports for TypeScript
export type Specialization = z.infer<typeof SpecializationSchema>;
export type CreateSpecialization = z.infer<typeof CreateSpecializationSchema>;
export type BulkCreateSpecialization = z.infer<
  typeof BulkCreateSpecializationSchema
>;
