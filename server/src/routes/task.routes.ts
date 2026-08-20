import { Router } from "express";
import {
  createTask,
  getMyTasks,
  getTaskById,
  updateTask,
} from "../controllers/task.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/:id", authMiddleware, getTaskById);
router.post("/", authMiddleware, createTask);
router.get("/", authMiddleware, getMyTasks);
router.put("/:id", authMiddleware, updateTask);

export default router;