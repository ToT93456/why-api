import { prisma } from "../database/prisma.js";

export const logAction = async (action: string, options?: { userId?: string; scriptId?: string; metadata?: unknown }) => {
  await prisma.log.create({
    data: {
      action,
      userId: options?.userId,
      scriptId: options?.scriptId,
      metadata: options?.metadata as object | undefined,
    },
  });
};
