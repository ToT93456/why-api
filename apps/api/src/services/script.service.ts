import { Prisma, ScriptVisibility, type UserRole } from "@prisma/client";

import { prisma } from "../database/prisma.js";
import { cache } from "../lib/cache.js";
import { AppError } from "../lib/http-error.js";
import { sha256 } from "../utils/hash.js";
import { makeSlug } from "../utils/slug.js";
import { logAction } from "./log.service.js";

type Viewer = {
  userId?: string;
  role?: UserRole;
};

type CreateScriptInput = {
  title: string;
  summary: string;
  content: string;
  version: string;
  changelog?: string;
  tags: string[];
  visibility: ScriptVisibility;
  categorySlug?: string;
  isObfuscated?: boolean;
};

const scriptInclude = {
  owner: { select: { id: true, username: true } },
  category: { select: { id: true, name: true, slug: true } },
  versions: { orderBy: { createdAt: "desc" as const }, take: 5 },
  _count: { select: { favorites: true, versions: true } },
} satisfies Prisma.ScriptInclude;

const canSeePrivate = (script: { ownerId: string; visibility: ScriptVisibility }, viewer?: Viewer) =>
  viewer?.role === "ADMIN" ||
  viewer?.role === "MODERATOR" ||
  viewer?.userId === script.ownerId ||
  script.visibility !== ScriptVisibility.PRIVATE;

export const scriptService = {
  async list(params: { search?: string; category?: string; featured?: string }, viewer?: Viewer) {
    const scripts = await prisma.script.findMany({
      where: {
        isPublished: true,
        ...(viewer?.role === "ADMIN" || viewer?.role === "MODERATOR"
          ? {}
          : { visibility: { in: [ScriptVisibility.PUBLIC, ScriptVisibility.UNLISTED] } }),
        ...(params.search
          ? {
              OR: [
                { title: { contains: params.search, mode: "insensitive" } },
                { summary: { contains: params.search, mode: "insensitive" } },
                { tags: { has: params.search.toLowerCase() } },
              ],
            }
          : {}),
        ...(params.category ? { category: { slug: params.category } } : {}),
        ...(params.featured === "true" ? { isFeatured: true } : {}),
      },
      include: scriptInclude,
      orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
    });

    return scripts.filter((script) => canSeePrivate(script, viewer));
  },

  async getBySlug(slug: string, viewer?: Viewer) {
    const script = await prisma.script.findUnique({
      where: { slug },
      include: {
        ...scriptInclude,
        versions: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!script || !script.isPublished || !canSeePrivate(script, viewer)) {
      throw new AppError(404, "Script not found");
    }

    await prisma.script.update({
      where: { id: script.id },
      data: { viewCount: { increment: 1 } },
    });

    return script;
  },

  async create(ownerId: string, input: CreateScriptInput) {
    const base = makeSlug(input.title);
    const slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;
    const category = input.categorySlug
      ? await prisma.category.findUnique({ where: { slug: input.categorySlug } })
      : null;

    const result = await prisma.$transaction(async (tx) => {
      const script = await tx.script.create({
        data: {
          ownerId,
          categoryId: category?.id,
          title: input.title,
          slug,
          summary: input.summary,
          tags: input.tags,
          visibility: input.visibility,
          isObfuscated: input.isObfuscated ?? false,
          isPublished: true,
        },
      });

      await tx.version.create({
        data: {
          scriptId: script.id,
          version: input.version,
          changelog: input.changelog,
          content: input.content,
          contentHash: sha256(input.content),
        },
      });

      return tx.script.findUniqueOrThrow({
        where: { id: script.id },
        include: scriptInclude,
      });
    });

    await logAction("script.create", {
      userId: ownerId,
      scriptId: result.id,
      metadata: { slug: result.slug },
    });

    await cache.del(`script:raw:${result.slug}`);
    return result;
  },

  async addVersion(slug: string, userId: string, role: UserRole, input: { version: string; changelog?: string; content: string }) {
    const script = await prisma.script.findUnique({ where: { slug } });
    if (!script) {
      throw new AppError(404, "Script not found");
    }

    if (script.ownerId !== userId && role !== "ADMIN" && role !== "MODERATOR") {
      throw new AppError(403, "You cannot update this script");
    }

    const version = await prisma.version.create({
      data: {
        scriptId: script.id,
        version: input.version,
        changelog: input.changelog,
        content: input.content,
        contentHash: sha256(input.content),
      },
    });

    await prisma.script.update({
      where: { id: script.id },
      data: { updatedAt: new Date() },
    });

    await cache.del(`script:raw:${slug}`);
    await logAction("script.add_version", {
      userId,
      scriptId: script.id,
      metadata: { version: input.version },
    });

    return version;
  },

  async getRaw(slug: string) {
    const cacheKey = `script:raw:${slug}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const script = await prisma.script.findUnique({
      where: { slug },
      include: {
        versions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!script || !script.isPublished || script.visibility === ScriptVisibility.PRIVATE) {
      throw new AppError(404, "Script not found");
    }

    const latest = script.versions[0];
    if (!latest) {
      throw new AppError(404, "Script version not found");
    }

    await prisma.script.update({
      where: { id: script.id },
      data: { downloadCount: { increment: 1 } },
    });

    await cache.set(cacheKey, latest.content, 60);
    return latest.content;
  },

  async toggleFavorite(scriptId: string, userId: string) {
    const existing = await prisma.favorite.findUnique({
      where: { userId_scriptId: { userId, scriptId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      await prisma.script.update({
        where: { id: scriptId },
        data: { favoriteCount: { decrement: 1 } },
      });
      return { favorited: false };
    }

    await prisma.favorite.create({ data: { scriptId, userId } });
    await prisma.script.update({
      where: { id: scriptId },
      data: { favoriteCount: { increment: 1 } },
    });
    return { favorited: true };
  },

  async adminDashboard() {
    const [users, scripts, versions, logs] = await Promise.all([
      prisma.user.count(),
      prisma.script.count(),
      prisma.version.count(),
      prisma.log.findMany({
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
    ]);

    return { users, scripts, versions, logs };
  },
};
