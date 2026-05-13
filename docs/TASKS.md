# Project Tasks

## Task 1 — End-to-end Supabase Backend Integration

**Goal:** Replace backend-critical flows with Supabase-powered auth, database, and storage so the whole PearlsRental product runs on a unified backend.

### Scope
- Integrate Supabase Auth for login, register, and session management.
- Model core rental data in Supabase Postgres (profiles, products, bookings, availability).
- Add Row Level Security (RLS) policies for customer/admin access boundaries.
- Migrate API routes and data access from Prisma/NextAuth patterns to Supabase clients where appropriate.
- Configure Supabase Storage for product images and related media.
- Add a migration + seed strategy for local/dev/prod parity.
- Validate the full booking lifecycle (browse → reserve → manage reservation) against Supabase data.

### Definition of Done
- Users can register, sign in, and access protected pages with Supabase auth.
- Catalog, product details, and reservation flows read/write from Supabase.
- RLS policies are enabled and verified for all exposed tables.
- Environment variables and setup steps are documented in `README.md`.
- Existing test suite passes, and any backend-related tests are updated for Supabase.
