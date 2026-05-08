# Pearl's Clothing Collection — Premium Clothing Rental SaaS

A modern, full-stack clothing rental platform built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and SQLite.

---

## ✨ Features

- 🛍️ **Product Catalog** — Filter by category, size, availability, price, search
- 🗓️ **Availability Calendar** — Real-time conflict detection
- 📍 **Pickup Map** — Leaflet + OpenStreetMap, no API key required
- 💵 **Cash on Pickup** — No online payment, simple reservation flow
- 👤 **User Dashboard** — Active rentals, wishlist, past history
- 🔐 **Admin Dashboard** — Inventory CRUD, rental status management, analytics
- 🌙 **Dark / Light Mode** — System preference + toggle
- 📱 **Mobile First** — Fully responsive design

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Install & Setup

```bash
npm install
```

### 2. Environment Variables

Copy `.env` (already provided) or create one:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
RESERVATION_EXPIRY_HOURS=24
```

### 3. Setup Database & Seed

```bash
npx prisma db push
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

Or use the combined setup script:

```bash
npm run setup
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Accounts

| Role  | Email                     | Password   |
|-------|---------------------------|------------|
| Admin | admin@pearlscollection.com     | admin123   |
| User  | demo@pearlscollection.com      | user123    |

Or use the **"Demo User"** / **"Demo Admin"** buttons on the login page.

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage
│   ├── catalog/            # Catalog with filters
│   ├── product/[slug]/     # Product detail page
│   ├── reservation/[id]/   # Reservation confirmation + map
│   ├── dashboard/          # User dashboard
│   ├── admin/              # Admin dashboard
│   ├── auth/               # Login & register
│   └── api/                # API routes
├── components/
│   ├── layout/             # Navbar, Footer, Hero, etc.
│   ├── product/            # ProductCard, ProductDetail, etc.
│   ├── rental/             # ReservationDetail
│   ├── map/                # Leaflet map component
│   └── admin/              # Admin modals
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   ├── auth.ts             # NextAuth config
│   └── utils.ts            # Helpers (formatCurrency, cn, etc.)
└── types/
    └── index.ts            # TypeScript types
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Demo seed data
```

---

## 🗄️ Database Models

- **User** — id, name, email, password (bcrypt), role (USER/ADMIN)
- **Product** — id, slug, name, category, size, color, fabric, images[], pricePerDay, status
- **Rental** — userId, productId, startDate, endDate, status, totalPrice, expiresAt
- **PickupLocation** — lat, lng, address, openingHours, notes
- **Favorite** — userId, productId
- **RecentlyViewed** — userId, productId

---

## 🔄 Rental Flow

1. User browses catalog → clicks product
2. Selects dates on availability calendar
3. Clicks **"Reserve Now"** → POST `/api/rentals`
4. System checks for date conflicts (prevents double-booking)
5. Status set to `RESERVED_UNPAID`, expiry set to 24h
6. User redirected to **Reservation Confirmation** page with map
7. User picks up item at store, pays cash → Admin updates to `PICKED_UP_PAID`
8. On return → Admin updates to `RETURNED`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (custom design system) |
| Database | SQLite (via Prisma ORM) |
| Auth | NextAuth.js (credentials) |
| State | TanStack React Query + Zustand |
| Map | Leaflet.js + OpenStreetMap |
| Calendar | react-day-picker |
| Notifications | react-hot-toast |

---

## 🏗️ Production Notes

- Replace SQLite with PostgreSQL: change `provider = "postgresql"` in `prisma/schema.prisma` and update `DATABASE_URL`
- Set a strong `NEXTAUTH_SECRET` (32+ characters)
- Configure `NEXTAUTH_URL` to your production domain
- Images are stored as URLs (integrate Cloudinary/S3 for file uploads)
- For Vercel, set these Environment Variables in the project settings: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `RESERVATION_EXPIRY_HOURS`
- The app now lives at the repository root (no nested `clothrental/` folder), so Vercel can deploy directly from this repo without a custom Root Directory

---

## 📘 Architecture & Deliverables

A comprehensive system design package (technical documentation, schema, API contract, wireframes, deployment/testing/maintenance strategy) is available at:

- `docs/CLOTHING_RENTAL_SYSTEM_DESIGN.md`

---

## 📜 Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push schema to database
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
npm run setup        # Full setup (install + db push + seed)
```
