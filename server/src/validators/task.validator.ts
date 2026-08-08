import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),

  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH"])
    .optional(),

  dueDate: z
    .string()
    .datetime()
    .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;