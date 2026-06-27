import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { scriptService } from "../services/script.service.js";

export const adminRouter = Router();

adminRouter.get(
  "/dashboard",
  requireAuth,
  requireRole("ADMIN", "MODERATOR"),
  async (_req, res, next) => {
    try {
      const result = await scriptService.adminDashboard();
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);
