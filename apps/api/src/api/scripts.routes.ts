import { Router } from "express";
import { ScriptVisibility } from "@prisma/client";
import { z } from "zod";

import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { scriptService } from "../services/script.service.js";

export const scriptsRouter = Router();

const listSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    featured: z.string().optional(),
  }),
});

const createSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    summary: z.string().min(10).max(500),
    content: z.string().min(1),
    version: z.string().min(1),
    changelog: z.string().optional(),
    tags: z.array(z.string().min(1)).max(8),
    visibility: z.nativeEnum(ScriptVisibility),
    categorySlug: z.string().optional(),
    isObfuscated: z.boolean().optional(),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const slugSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    slug: z.string().min(1),
  }),
  query: z.object({}).default({}),
});

const versionSchema = z.object({
  body: z.object({
    version: z.string().min(1),
    changelog: z.string().optional(),
    content: z.string().min(1),
  }),
  params: z.object({
    slug: z.string().min(1),
  }),
  query: z.object({}).default({}),
});

const favoriteSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).default({}),
});

scriptsRouter.get("/", validate(listSchema), async (req, res, next) => {
  try {
    const result = await scriptService.list(req.query, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

scriptsRouter.post("/", requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const result = await scriptService.create(req.user!.userId, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

scriptsRouter.get("/:slug/raw", validate(slugSchema), async (req, res, next) => {
  try {
    const content = await scriptService.getRaw(req.params.slug);
    res.type("text/plain").send(content);
  } catch (error) {
    next(error);
  }
});

scriptsRouter.get("/:slug", validate(slugSchema), async (req, res, next) => {
  try {
    const result = await scriptService.getBySlug(req.params.slug, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

scriptsRouter.post("/:slug/versions", requireAuth, validate(versionSchema), async (req, res, next) => {
  try {
    const result = await scriptService.addVersion(req.params.slug, req.user!.userId, req.user!.role, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

scriptsRouter.post("/:id/favorite", requireAuth, validate(favoriteSchema), async (req, res, next) => {
  try {
    const result = await scriptService.toggleFavorite(req.params.id, req.user!.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
