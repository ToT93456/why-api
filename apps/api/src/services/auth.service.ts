import { randomUUID } from "node:crypto";

import { UserRole } from "@prisma/client";

import { prisma } from "../database/prisma.js";
import { AppError } from "../lib/http-error.js";
import { comparePassword, hashPassword, sha256 } from "../utils/hash.js";
import { signAccessToken, signRefreshToken, verifyToken } from "../utils/jwt.js";
import { logAction } from "./log.service.js";

type RegisterInput = {
  email: string;
  username: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
};

const toSafeUser = (user: {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  emailVerifiedAt: Date | null;
}) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  role: user.role,
  emailVerifiedAt: user.emailVerifiedAt,
});

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { username: input.username }],
      },
    });

    if (existing) {
      throw new AppError(409, "Email or username already exists");
    }

    const verificationToken = randomUUID();
    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash: await hashPassword(input.password),
        verificationToken,
      },
    });

    await logAction("auth.register", { userId: user.id });

    return {
      user: toSafeUser(user),
      verificationToken,
    };
  },

  async verifyEmail(token: string) {
    const user = await prisma.user.findUnique({ where: { verificationToken: token } });
    if (!user) {
      throw new AppError(404, "Verification token not found");
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        verificationToken: null,
      },
    });

    await logAction("auth.verify_email", { userId: updated.id });
    return toSafeUser(updated);
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, "Invalid email or password");
    }

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: sha256(randomUUID()),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      sessionId: session.id,
    });

    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: sha256(refreshToken) },
    });

    await logAction("auth.login", {
      userId: user.id,
      metadata: { sessionId: session.id },
    });

    return {
      user: toSafeUser(user),
      accessToken: signAccessToken({
        userId: user.id,
        role: user.role,
        email: user.email,
        sessionId: session.id,
      }),
      refreshToken,
    };
  },

  async refresh(refreshToken: string) {
    const payload = verifyToken(refreshToken);
    const session = await prisma.session.findUnique({ where: { id: payload.sessionId } });

    if (!session || session.refreshToken !== sha256(refreshToken) || session.expiresAt < new Date()) {
      throw new AppError(401, "Refresh token invalid or expired");
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      throw new AppError(404, "User not found");
    }

    return {
      accessToken: signAccessToken({
        userId: user.id,
        role: user.role,
        email: user.email,
        sessionId: session.id,
      }),
    };
  },

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { ok: true };
    }

    const resetToken = randomUUID();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await logAction("auth.password_reset_requested", { userId: user.id });
    return { ok: true, resetToken };
  },

  async resetPassword(token: string, password: string) {
    const user = await prisma.user.findUnique({ where: { resetToken: token } });
    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      throw new AppError(400, "Reset token invalid or expired");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(password),
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    await logAction("auth.password_reset_completed", { userId: user.id });
    return { ok: true };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
        bio: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  },
};
