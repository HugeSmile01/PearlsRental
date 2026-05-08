# Clothing Rental Management System: Technical Design & Implementation Plan

## 1) System Overview

This platform is an **admin-managed clothing rental e-commerce system** with customer browsing and booking capabilities. It is optimized for high inventory visibility, rental conflict prevention, secure payment handling, and operational workflows (pickup, returns, maintenance, damage).

### Primary Actors
- **Administrator**: manages catalog, inventory lifecycle, pricing rules, bookings, returns, maintenance, analytics.
- **Customer**: registers/logs in, browses catalog, checks availability, books rentals, pays, tracks rental status.

### Core Objectives
- Prevent double-booking with deterministic conflict checks.
- Keep inventory state consistent across booking and fulfillment lifecycle.
- Support horizontal scale via service decomposition and caching.
- Maintain compliance/security posture (JWT, RBAC, PCI-aware integration, encryption).

---

## 2) High-Level Architecture (Microservices)

## Services
1. **API Gateway / BFF**
   - Single ingress endpoint for frontend.
   - JWT verification and route-level RBAC.
   - Rate limiting, request tracing headers.

2. **User Management Service**
   - Registration, login, password reset.
   - Profile and preference management.
   - Role administration (ADMIN, CUSTOMER).

3. **Inventory Service**
   - Product CRUD (size/color/brand/condition/media).
   - Inventory status transitions (`AVAILABLE`, `RESERVED`, `RENTED`, `MAINTENANCE`, `DAMAGED`, `RETIRED`).
   - Stock and maintenance alerts.

4. **Booking Service**
   - Rental quote computation.
   - Calendar availability check and reservation creation.
   - Return check-in and overdue tracking.

5. **Payment Service**
   - Payment intent creation and confirmation through a PCI-compliant provider (e.g., Stripe/Adyen).
   - Webhook reconciliation and refund handling.

6. **Notification Service**
   - Email/SMS/in-app notifications.
   - Real-time WebSocket events for status updates.

7. **Recommendation Service**
   - Item suggestions using user behavior and popularity vectors.

### Shared Infrastructure
- **PostgreSQL** (system of record).
- **Redis** (cache, locks, session/token blacklist support).
- **Object Storage + CDN** for product images.
- **Message broker** (RabbitMQ/Kafka) for async workflows (payment events, notifications).
- **Observability stack** (OpenTelemetry + Prometheus + Grafana + centralized logs).

---

## 3) Frontend Design (React/Next.js)

### UX & UI Principles
- Mobile-first responsive layout using **CSS Grid/Flexbox**.
- WCAG 2.1 AA accessibility: contrast, keyboard support, semantic landmarks, ARIA labels, focus management.
- Cross-browser support: latest Chrome, Firefox, Safari, Edge.

### Recommended Component Domains
- `Catalog`: filters, sort, pagination, product cards.
- `ProductDetail`: image gallery, attributes, availability calendar, price breakdown.
- `BookingFlow`: date picker, summary, payment, confirmation.
- `Dashboard`: current rentals, history, favorites, profile.
- `AdminConsole`: product CRUD, booking queue, return processing, maintenance board, analytics.

### PWA Features
- Web app manifest + installability.
- Service worker for shell caching and offline fallback pages.
- Background sync for non-critical events (favorites, telemetry).
- Push notifications for due-date reminders and booking updates.

---

## 4) Database Schema (PostgreSQL)

```sql
-- roles and auth
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN','CUSTOMER')),
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- catalog and inventory
CREATE TABLE brands (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id)
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id),
  category_id UUID REFERENCES categories(id),
  description TEXT,
  base_daily_price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE','INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  condition_grade TEXT NOT NULL,
  replacement_value NUMERIC(10,2) NOT NULL,
  barcode TEXT UNIQUE,
  inventory_status TEXT NOT NULL CHECK (inventory_status IN ('AVAILABLE','RESERVED','RENTED','MAINTENANCE','DAMAGED','RETIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  position INT NOT NULL DEFAULT 0
);

-- rental lifecycle
CREATE TABLE rentals (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('PENDING_PAYMENT','CONFIRMED','PICKED_UP','RETURNED','CANCELLED','OVERDUE')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  discount_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE TABLE rental_items (
  id UUID PRIMARY KEY,
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id),
  unit_daily_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE (rental_id, product_variant_id)
);

CREATE TABLE booking_calendar (
  id UUID PRIMARY KEY,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  reserved_from DATE NOT NULL,
  reserved_to DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('HELD','BOOKED','BLOCKED')),
  CHECK (reserved_to >= reserved_from)
);

-- Exclusion constraint to prevent overlapping bookings for BOOKED/HOLD windows
-- Requires btree_gist extension.
-- ALTER TABLE booking_calendar ADD CONSTRAINT no_overlap
--   EXCLUDE USING gist (
--     product_variant_id WITH =,
--     daterange(reserved_from, reserved_to, '[]') WITH &&
--   ) WHERE (status IN ('HELD','BOOKED'));

CREATE TABLE returns (
  id UUID PRIMARY KEY,
  rental_id UUID NOT NULL REFERENCES rentals(id),
  received_at TIMESTAMPTZ,
  condition_notes TEXT,
  late_fee NUMERIC(10,2) DEFAULT 0,
  damage_fee NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE payments (
  id UUID PRIMARY KEY,
  rental_id UUID NOT NULL REFERENCES rentals(id),
  provider TEXT NOT NULL,
  provider_intent_id TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('REQUIRES_ACTION','AUTHORIZED','CAPTURED','FAILED','REFUNDED')),
  amount NUMERIC(10,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  actor_user_id UUID REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Critical Indexes
- `booking_calendar(product_variant_id, reserved_from, reserved_to)`
- `rentals(user_id, status)`
- `product_variants(product_id, inventory_status, size, color)`
- Full text index on `products(name, description)`

---

## 5) REST API Specification (v1)

Base URL: `/api/v1`

### Auth
- `POST /auth/register` → create customer account.
- `POST /auth/login` → returns access JWT + refresh token.
- `POST /auth/refresh` → rotate access token.
- `POST /auth/logout` → revoke refresh token.

### Catalog
- `GET /products` (filters: category, brand, size, color, minPrice, maxPrice, availableFrom, availableTo, q, page).
- `GET /products/{slug}`.
- `GET /products/{id}/availability?from=YYYY-MM-DD&to=YYYY-MM-DD`.

### Rentals
- `POST /rentals/quote` → compute pricing without booking.
- `POST /rentals` → create rental + hold inventory.
- `GET /rentals/{id}`.
- `POST /rentals/{id}/cancel`.
- `POST /rentals/{id}/pickup` (admin).
- `POST /rentals/{id}/return` (admin).

### Payments
- `POST /payments/intents` → create payment intent.
- `POST /payments/webhooks/provider` → asynchronous confirmation.
- `POST /payments/{id}/refund` (admin).

### Admin Inventory
- `POST /admin/products`
- `PATCH /admin/products/{id}`
- `POST /admin/variants`
- `PATCH /admin/variants/{id}/status`
- `GET /admin/rentals?status=`
- `GET /admin/analytics/overview`

### Notifications
- `POST /notifications/test` (admin)
- `GET /notifications/preferences`
- `PATCH /notifications/preferences`

### API Standards
- Use HTTP status codes (`200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`).
- RFC7807-compatible error payload:
```json
{
  "type": "https://api.example.com/errors/conflict",
  "title": "Booking conflict",
  "status": 409,
  "detail": "Selected item is not available for the chosen dates",
  "traceId": "..."
}
```

---

## 6) Core Algorithms

### A) Availability / Conflict Detection
1. Normalize request dates to UTC date boundaries.
2. Acquire distributed lock for `product_variant_id` (Redis lock, 3-5s TTL).
3. Query overlapping windows:
   - overlap if `requested_from <= reserved_to AND requested_to >= reserved_from`
4. If overlap exists for `HELD/BOOKED` → reject with `409`.
5. Insert hold row with expiration.
6. Convert `HELD` to `BOOKED` on payment capture.

### B) Dynamic Pricing
`final_price = base_price * demand_factor * season_factor * popularity_factor - discounts`

- `demand_factor`: active utilization ratio by category/date.
- `season_factor`: configurable calendar multipliers (events/holidays).
- `popularity_factor`: click-through + conversion weighted score.
- Hard floor/ceiling rules to avoid extreme values.

### C) Recommendation Engine
- Hybrid approach:
  - Content-based similarity: category/brand/size/color/occasion vectors.
  - Collaborative signal: co-viewed/co-rented graph.
- Fallback: trending + in-stock items for cold start.

### D) Inventory Optimization
- Low stock alert: trigger when available variants below threshold.
- Maintenance schedule:
  - periodic check based on number of rental cycles.
  - auto-route to `MAINTENANCE` after return if inspection fails.

---

## 7) Wireframes (Textual)

### Customer Mobile Home
- Top: logo + search + profile icon
- Hero banner
- Category chips (horizontal scroll)
- Product grid (2 columns)
- Bottom nav: Home / Catalog / Rentals / Account

### Product Detail
- Image carousel
- Name + brand + rating
- Price/day + deposit
- Size/color selectors
- Availability calendar
- Sticky CTA: "Reserve"

### Booking Checkout
- Selected dates
- Price breakdown (daily × days + fees + tax)
- Payment method
- Confirm button

### Admin Dashboard
- KPI cards: utilization, overdue, revenue, damaged items
- Tabs: Inventory / Rentals / Returns / Maintenance / Analytics
- Data table with bulk actions
- Right drawer: item timeline + audit log

---

## 8) Security Controls

- JWT access tokens (short TTL) + rotating refresh tokens.
- Role-based access control at gateway + service layer.
- Input validation via schema validators (Zod/Joi/Pydantic).
- SQL injection/XSS/CSRF mitigation and output encoding.
- Rate limiting + bot mitigation + WAF.
- TLS 1.2+ in transit; AES-256 at rest.
- Secrets in manager (AWS Secrets Manager/GCP Secret Manager).
- Payment card data never stored in application DB (tokenized provider flow).
- Audit logs for all privileged/admin actions.

---

## 9) Deployment Strategy

### Environments
- **dev**, **staging**, **production** with isolated databases and secrets.

### CI/CD Pipeline
1. Lint + type checks + unit tests.
2. Build frontend + services.
3. Integration tests (ephemeral DB/Redis).
4. Security scans (SAST + dependency audit).
5. Deploy to staging (blue/green or canary).
6. Smoke tests + synthetic checks.
7. Promote to production with automated rollback hooks.

### Infrastructure (example: AWS)
- ECS/EKS for services.
- RDS PostgreSQL (Multi-AZ).
- ElastiCache Redis.
- S3 + CloudFront CDN for images.
- ALB/API Gateway + WAF.

### Data Migration
- Versioned migrations (Prisma/Flyway).
- Backward-compatible schema changes first.
- Zero-downtime migration policy (expand-migrate-contract).

---

## 10) Testing Procedures

### Unit Tests
- Availability overlap logic.
- Price calculator rule combinations.
- Auth token and RBAC guards.

### Integration Tests
- Rental create flow with real DB transaction rollback.
- Payment webhook idempotency.
- Inventory status transitions across booking lifecycle.

### End-to-End Tests
- Customer: browse → reserve → pay → confirmation.
- Admin: create product → approve pickup → process return.

### Performance Tests
- p95 API latency targets:
  - catalog query < 250ms (cached)
  - availability check < 150ms
  - booking create < 300ms
- Load tests for seasonal spikes.

### Security Tests
- OWASP ASVS-focused tests.
- Auth bypass and privilege escalation checks.
- Dependency CVE scanning in CI.

---

## 11) Maintenance & Operations Guidelines

### Runbooks
- Failed payment reconciliation
- Overdue rental escalation
- Inventory damage adjudication
- Emergency rollback

### SLO / SLA Suggestions
- 99.9% API uptime
- <1% booking error rate
- <15 min incident acknowledgment

### Housekeeping Jobs
- Expire unpaid holds every N minutes.
- Recompute recommendation vectors nightly.
- Archive old audit logs to cold storage.

### Observability Checklist
- Correlation IDs across services.
- Dashboards by service + business KPI overlays.
- Alerting for error budget burn, DB saturation, queue backlogs.

---

## 12) Implementation Roadmap

### Phase 1 (MVP)
- Auth + catalog + single-item booking + payment + admin inventory CRUD.

### Phase 2
- Dynamic pricing, recommendations, maintenance workflows, notifications.

### Phase 3
- Multi-location inventory pooling, advanced analytics, automated fraud signals.

---

## 13) Suggested Enhancements to Existing Next.js Codebase

- Move from monolith API routes to domain modules and eventually independent deployable services.
- Switch DB provider to PostgreSQL for production scale.
- Add Redis-based cache and distributed locks for availability checks.
- Introduce webhook-driven payment reconciliation with idempotency keys.
- Add service worker/manifest for complete PWA support.
