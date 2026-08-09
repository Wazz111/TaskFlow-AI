import prisma from "../config/database";
import { CreateTaskInput } from "../validators/task.validator";

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