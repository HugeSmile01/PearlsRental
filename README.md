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
```

Database models

- User — id, name, email, password, role
- Product — id, slug, name, category, size, color, images[], pricePerDay, status
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
npm run build
npm run start
npm run start:prod
npm run db:push
npm run db:seed
npm run db:studio
npm run setup
```
