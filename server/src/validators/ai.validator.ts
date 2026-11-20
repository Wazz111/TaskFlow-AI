
import { z } from "zod";

export const aiBreakdownSchema = z.object({
  goal: z
    .string()
    .trim()
    .min(10, "Goal must be at least 10 characters")
    .max(500, "Goal cannot exceed 500 characters"),
});

export type AIBreakdownInput = z.infer<
  typeof aiBreakdownSchema
>;
