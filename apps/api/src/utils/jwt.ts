import jwt from "jsonwebtoken";

import { env } from "../lib/env.js";

export type JwtPayload = {
  userId: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  email: string;
  sessionId?: string;
};

export const signAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });

export const signRefreshToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token: string) => jwt.verify(token, env.JWT_SECRET) as JwtPayload;
