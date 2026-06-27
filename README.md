# Lua Script Hub

Production-ready monorepo for hosting, organizing, and serving legitimate Lua scripts.

## Stack

- Next.js App Router frontend
- Express.js API backend
- Prisma ORM with PostgreSQL
- Tailwind CSS + Framer Motion UI
- JWT auth with role-based access control

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Generate Prisma client and run migrations:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. Start frontend and backend:

```bash
npm run dev:api
npm run dev:web
```

## Render Deployment

- Push repository to GitHub.
- Create a new Blueprint deployment on Render using `render.yaml`.
- Provision the managed PostgreSQL database.
- Set `NEXT_PUBLIC_API_URL` to the API service URL and `FRONTEND_URL` to the web URL.
- Run `npx prisma migrate deploy` during the API deploy if you add migrations.

## Security Notes

- Upload only Lua scripts you are authorized to store and distribute.
- The platform serves uploaded script content and metadata; it does not include script obfuscation logic.
