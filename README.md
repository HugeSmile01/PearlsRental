# PearlsRental

PearlsRental is a full-stack clothing rental application built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

Overview

- Product catalog with filters and search
- Availability checks to prevent double-booking
- Pickup locations displayed on a map (Leaflet)
- Reservation flow with admin-managed pickup and payment
- Admin dashboard for inventory and rental management
- Dark/light theme support

Quick start

Prerequisites

- Node.js 18+
- npm

Install dependencies

```bash
npm install
```

Set environment variables

Copy `.env.example` to `.env` and update values. Example:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
RESERVATION_EXPIRY_HOURS=24
NEXT_PUBLIC_SUPABASE_URL="https://<project-id>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
# optional (currently not used by app runtime)
SUPABASE_SERVICE_ROLE_KEY=""
SKIP_SQLITE_PRODUCTION_CHECK=true
```

Database setup (development)

```bash
npm run db:push
npm run db:seed
```

Development server

```bash
npm run dev
```

Production build (local)

To build locally (the repository allows a local SQLite override for `next build`):

```bash
SKIP_SQLITE_PRODUCTION_CHECK=true npm run build
npm run start
```

Project structure

```
src/
├── app/                    # Next.js App Router pages and api routes
├── components/             # Reusable React components
├── lib/                    # Server and helper utilities
└── types/                  # TypeScript types
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Demo seed data
supabase-schema.sql         # Optional Supabase schema + RLS reference script
```

## Runtime architecture (current)

- **Data/API backend:** Prisma + Next.js App Router API routes.
- **Authorization for protected APIs:** NextAuth session checks.
- **Client login/register UI:** Supabase auth requests from auth pages.
- **Current state:** hybrid wiring during migration, not a full Supabase-only backend.

### Implemented API routes

- `GET /api/products`
- `GET /api/products/[slug]`, `PUT /api/products/[slug]` (admin)
- `GET /api/rentals`, `POST /api/rentals`
- `PATCH /api/rentals/[id]`, `DELETE /api/rentals/[id]`
- `GET /api/rentals/availability`
- `POST /api/admin/products`, `DELETE /api/admin/products`
- `GET /api/admin/analytics`
- `GET /api/user/favorites`, `POST /api/user/favorites`
- `GET /api/locations`
- `GET /api/recommendations`
- `GET /api/health`
- `GET/POST /api/auth/[...nextauth]`

Database models

- User — id, name, email, password, role
- Product — id, slug, name, category, size, color, `images` (JSON string), `tags` (JSON string), pricePerDay, status
- Rental — userId, productId, startDate, endDate, status, totalPrice, expiresAt
- PickupLocation — lat, lng, address, openingHours, notes
- Favorite — userId, productId
- RecentlyViewed — userId, productId

Production notes

- For production, switch Prisma datasource to PostgreSQL and set `DATABASE_URL` accordingly.
- Set a strong `NEXTAUTH_SECRET` (32+ characters) and configure `NEXTAUTH_URL`.
- Use an object store or CDN for images in production.

Scripts

```bash
npm run dev
npm run lint        # TypeScript check (tsc --noEmit)
npm run typecheck   # TypeScript check (tsc --noEmit)
npm test
npm run build
npm run start
npm run start:prod
npm run db:push
npm run db:seed
npm run db:studio
npm run setup
```

UI conventions

- See `docs/UI_CONVENTIONS.md` for button, typography, token, and spacing guardrails.

## Supabase integration status

Supabase is currently used by client auth pages, while protected application APIs still rely on NextAuth session authorization and Prisma data access.

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL="https://<project-id>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
# optional (currently not used in runtime code)
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

### Optional schema and RLS reference

1. Open Supabase SQL Editor.
2. Run `supabase-schema.sql` from the repository root.
3. Verify policies are enabled for `profiles`, `products`, and `bookings`.

### Storage

Create a `product-images` public bucket in Supabase Storage for catalog media.

### Current app wiring

- Login and registration use Supabase Auth from client pages.
- Protected routes and API authorization use NextAuth sessions.
- Prisma remains the active data layer for the main `/api/*` routes.
- Schema and RLS policies in `supabase-schema.sql` are maintained as migration/reference material.
