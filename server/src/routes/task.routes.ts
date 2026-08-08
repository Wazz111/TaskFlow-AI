import { Router } from "express";
import { createTask } from "../controllers/task.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createTask);

export default router;