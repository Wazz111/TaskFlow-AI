import { Request, Response, NextFunction } from "express";
import { createTaskSchema } from "../validators/task.validator";
import * as taskService from "../services/task.service";

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsed = createTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const task = await taskService.createTask(
      req.user!.userId,
      parsed.data
    );

    return res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};