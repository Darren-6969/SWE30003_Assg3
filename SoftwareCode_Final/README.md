# National Parks Online Portal — Refactored (Next.js + Prisma + API)

Layered architecture for the Java NPOP domain, now with persistence (SQLite via Prisma) and API-backed UI.

## Quick start
```bash
cd web
npm install
npx prisma db push
npx prisma db seed
npm run dev

Note: The project uses a JavaScript seed script at `prisma/seed.js` (referenced by `package.json#prisma.seed`) so `npx prisma db seed` runs across environments without requiring `ts-node` ESM loaders.
```