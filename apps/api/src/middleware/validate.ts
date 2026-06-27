import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

import { AppError } from "../lib/http-error.js";

export const validate = (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!parsed.success) {
    return next(new AppError(400, parsed.error.issues.map((issue) => issue.message).join(", ")));
  }

  req.body = parsed.data.body;
  req.params = parsed.data.params;
  req.query = parsed.data.query;
  return next();
};
