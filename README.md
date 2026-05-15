# PearlsRental

PearlsRental is a clothing rental platform built with Next.js 14, TypeScript, Tailwind CSS, **Supabase Authentication**, and a **Supabase PostgreSQL** database.

## Supabase-first architecture

- Authentication: Supabase Auth
- Database: Supabase Postgres (via `DATABASE_URL`)
- API layer: Next.js App Router routes

## Quick start

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

```env
DATABASE_URL="postgresql://..."   # Supabase Postgres connection string
NEXT_PUBLIC_SUPABASE_URL="https://<project-id>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
RESERVATION_EXPIRY_HOURS=24
```

3. Apply schema to Supabase

- Option A (recommended): Use Supabase migrations/SQL Editor with `supabase-schema.sql`.
- Option B: Use Prisma migrations against the Supabase Postgres URL.

4. Run development server

```bash
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm test
```

## Notes

- Local SQLite setup has been removed from project defaults.
- NextAuth environment references have been removed; authentication is Supabase-based.
