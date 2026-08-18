import prisma from "../config/database";
import { CreateTaskInput } from "../validators/task.validator";
import { ApiError } from "../utils/ApiError";

export const createTask = async (
  userId: string,
  data: CreateTaskInput
) => {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority ?? "MEDIUM",
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      userId,
    },
  });
};

export const getMyTasks = async (userId: string) => {
  return prisma.task.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getTaskById = async (
  taskId: string,
  userId: string
) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return task;
};