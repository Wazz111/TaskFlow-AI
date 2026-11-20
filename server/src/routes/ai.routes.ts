
import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import { authMiddleware } from "../middleware/auth.middleware";
import { breakdownGoal } from "../controllers/ai.controller";

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many AI requests. Please try again later.",
  },
  keyGenerator: (req) => req.user!.userId,
});

router.post(
  "/breakdown",
  authMiddleware,
  aiLimiter,
  breakdownGoal
);

export default router;
