# Render Deployment Guide

## Services

- `lua-script-api`: Express API + Prisma
- `lua-script-web`: Next.js frontend
- `lua-script-db`: PostgreSQL managed database

## Environment Variables

### API

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `FRONTEND_URL`
- `REDIS_URL` (optional)

### Web

- `NEXT_PUBLIC_API_URL`

## Deploy Steps

1. Push this repository to GitHub.
2. In Render, create a new `Blueprint` deployment from the repository.
3. Render will detect `render.yaml` and provision both web services plus PostgreSQL.
4. Set the final service URLs:
   - `FRONTEND_URL` on the API service
   - `NEXT_PUBLIC_API_URL` on the web service
5. After first database creation, run Prisma commands in the API shell if needed:

```bash
npm --workspace apps/api run db:generate
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npm --workspace apps/api run db:seed
```

## Raw Script Endpoint

Once a script is created, the latest version can be fetched from:

```text
/api/v1/scripts/:slug/raw
```

Example:

```text
https://lua-script-api.onrender.com/api/v1/scripts/hello-lua/raw
```

## Notes

- The platform stores and delivers uploaded Lua content.
- Obfuscation logic is intentionally not part of this codebase.
- If you want CDN-like delivery later, place Cloudflare or another cache layer in front of the API.
