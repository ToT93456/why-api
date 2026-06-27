import type { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/http-error.js";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details ?? null,
    });
  }

  return res.status(500).json({
    error: "Internal server error",
  });
};
