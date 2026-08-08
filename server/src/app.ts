import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 TaskFlow AI Backend is running!",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);

app.use(errorMiddleware);

export default app;