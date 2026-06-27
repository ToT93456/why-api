import type { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/http-error.js";
import { verifyToken } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: "USER" | "MODERATOR" | "ADMIN";
        email: string;
        sessionId?: string;
      };
    }
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new AppError(401, "Authentication required"));
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return next(new AppError(401, "Invalid token"));
  }
};
