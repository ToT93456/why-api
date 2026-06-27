import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";

import { PrismaClient, ScriptVisibility, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  const passwordHash = await bcrypt.hash("Admin1234!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      username: "admin",
      passwordHash,
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date(),
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: "utility" },
    update: {},
    create: {
      name: "Utility",
      slug: "utility",
      description: "General-purpose Lua scripts.",
    },
  });

  const script = await prisma.script.upsert({
    where: { slug: "hello-lua" },
    update: {},
    create: {
      ownerId: admin.id,
      categoryId: category.id,
      title: "Hello Lua",
      slug: "hello-lua",
      summary: "Sample hosted Lua script.",
      tags: ["sample", "lua"],
      visibility: ScriptVisibility.PUBLIC,
      isPublished: true,
      isObfuscated: true,
    },
  });

  const content = "local name = 'Lua Script Hub'\nprint('Hello from '..name)\n";

  await prisma.version.upsert({
    where: {
      scriptId_version: {
        scriptId: script.id,
        version: "1.0.0",
      },
    },
    update: {},
    create: {
      scriptId: script.id,
      version: "1.0.0",
      changelog: "Initial seed version.",
      content,
      contentHash: createHash("sha256").update(content).digest("hex"),
    },
  });
};

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
