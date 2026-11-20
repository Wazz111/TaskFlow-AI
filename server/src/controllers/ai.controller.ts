
import type {
    Request,
    Response,
    NextFunction,
  } from "express";

  import { aiBreakdownSchema } from "../validators/ai.validator";
  import { generateTaskBreakdown } from "../services/ai.service";

  export const breakdownGoal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const parsed = aiBreakdownSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const result = await generateTaskBreakdown(
        parsed.data.goal
      );

      return res.status(200).json({
        success: true,
        message: "AI tasks generated successfully",
        tasks: result.tasks,
      });
    } catch (error) {
      next(error);
    }
  };
