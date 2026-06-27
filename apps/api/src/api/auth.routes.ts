import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authService } from "../services/auth.service.js";

export const authRouter = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    username: z.string().min(3).max(24),
    password: z.string().min(8),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const tokenSchema = z.object({
  body: z.object({
    token: z.string().min(1),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const resetSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

authRouter.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") ?? undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", validate(refreshSchema), async (req, res, next) => {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/verify-email", validate(tokenSchema), async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.body.token);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post(
  "/password-reset/request",
  validate(
    z.object({
      body: z.object({ email: z.string().email() }),
      params: z.object({}).default({}),
      query: z.object({}).default({}),
    }),
  ),
  async (req, res, next) => {
    try {
      const result = await authService.requestPasswordReset(req.body.email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post("/password-reset/confirm", validate(resetSchema), async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const result = await authService.getMe(req.user!.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
