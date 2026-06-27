import type { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/http-error.js";

type Role = "USER" | "MODERATOR" | "ADMIN";

export const requireRole = (...roles: Role[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(403, "Insufficient permissions"));
  }

  return next();
};
