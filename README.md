# Jay Maa Sheetala Tours & Travel — Web Platform (Production Ready)

A modern, high-trust, and full-featured Tours & Travels web application built for outstation car rentals, tour packages, fleet discovery, online bookings, advance payment verification, driver assignment, customer tracking, and comprehensive admin operations for **Jay Maa Sheetala Tours & Travel**.

---

## Key Features

### 1. Customer Experience & Fleet Discovery
- **Dynamic Fleet Catalog (`/vehicles`)**: Live inventory of sedans (Dzire, Etios), premium SUVs (Innova Crysta), and tempo travellers with seating/luggage capacity, AC status, and transparent per-km and per-day base rates.
- **Dynamic Vehicle Details (`/vehicles/[slug]`)**: Rich vehicle showcase, image gallery, specifications, customer reviews, dynamic Open Graph/Twitter preview cards, and mobile-friendly sticky CTAs.
- **Instant Booking Inquiry (`/book`)**: Multi-step booking request form supporting One-Way and Round-Trip routes with automatic fare estimation.
- **Real-Time Booking Status & Tracking (`/booking/[bookingRef]`)**: Unique reference tracking (e.g., `TT-2026-XXXX`), live timeline progress, assigned chauffeur details, printable trip receipts, and verified customer self-cancellation.
- **Advance Payment & Verification (`/api/payments/*`)**: Modular payment gateway integration with cryptographic signature verification and fallback simulation for test environments.
- **Social Proof & Reviews (`/reviews`)**: Moderated traveler feedback with verified Justdial badge attribution.
- **Direct Multi-Channel CTAs**: Seamless one-tap mobile phone dialer and WhatsApp coordinator links pre-filled with trip metadata.

### 2. Admin Operations Console (`/admin`)
- **Protected Dashboard (`/admin`)**: Metric cards for active fleet count, pending/confirmed/completed/cancelled bookings, total advance revenue collected, and recent inquiry activity.
- **Booking Management (`/admin/bookings`)**: Real-time status lifecycle management (`PENDING` → `CONFIRMED` → `COMPLETED` / `CANCELLED`), authoritative final price adjustments, advance requirements, and driver assignment.
- **Driver Management (`/admin/drivers`)**: Driver directory, commercial licensing records, contact info, and availability tracking with automated conflict detection for overlapping trips.
- **Fleet Management (`/admin/vehicles`)**: Full CRUD operations for vehicle records, specs, pricing, and multi-image gallery management with primary photo selection.
- **Review Moderation (`/admin/reviews`)**: Approve, hide, or delete customer-submitted ratings.

### 3. Reliability, SEO & Production Hardening
- **SEO & Social Metadata**: Dynamic metadata generation (`generateMetadata`), canonical links, Open Graph cards, and Twitter summary cards for all public pages.
- **Dynamic Sitemap & Robots (`/sitemap.xml`, `/robots.txt`)**: Auto-generated Next.js App Router sitemap including all active fleet slugs.
- **Sliding-Window Rate Limiting (`src/lib/rate-limit.ts`)**: Server-side in-memory rate limiting protecting public endpoints (`POST /api/bookings`, `POST /api/reviews`, `POST /api/bookings/[bookingRef]/cancel`, `POST /api/payments/*`, and `POST /api/admin/auth/login`).
- **Production Error Boundaries & Skeletons**: Friendly customer fallback pages, 404 handler, and shimmer loading skeletons for optimal perceived performance.
- **Modular Email Notifications (`src/lib/services/email.service.ts`)**: SMTP-backed notification engine sending branded transactional emails on booking confirmation, payment verification, trip cancellation, and completion.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components & Route Handlers)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS
- **Database & ORM:** PostgreSQL with Prisma ORM
- **Validation:** Zod
- **Authentication:** JWT sessions via `jose` with HTTP-only secure cookies
- **Icons:** Lucide React

---

## Project Structure

```
Tours-Travels/
├── prisma/
│   ├── schema.prisma          # Database schema (Vehicles, Drivers, Bookings, Payments, Reviews, Users)
│   └── seed.ts                # Database seed script for development and testing
├── public/
│   └── images/                # Static assets and hero banners
├── src/
│   ├── app/
│   │   ├── (customer)/        # Public pages (Home, Fleet, Booking, Status, Reviews, Contact)
│   │   ├── (admin)/           # Admin console (Dashboard, Bookings, Drivers, Fleet, Reviews)
│   │   ├── api/               # Protected and public REST API routes
│   │   ├── layout.tsx         # Root layout with metadata base
│   │   ├── robots.ts          # Robots.txt configuration
│   │   ├── sitemap.ts         # Dynamic sitemap generator
│   │   ├── error.tsx          # Production error boundary
│   │   └── not-found.tsx      # Global 404 page
│   ├── components/
│   │   ├── ui/                # UI primitives (Button, Badge, Modal, Input)
│   │   ├── customer/          # Customer components (Navbar, Footer, Timeline, Payment, Cancel modal)
│   │   └── admin/             # Admin components (Sidebar, Topbar, Status filters)
│   ├── lib/
│   │   ├── company.config.ts  # Centralized company settings
│   │   ├── db.ts              # Singleton Prisma client instance
│   │   ├── auth.ts            # JWT authentication & session verification
│   │   ├── rate-limit.ts      # Sliding-window in-memory rate limiter
│   │   ├── services/          # Business logic services (Booking, Vehicle, Driver, Payment, Email, Auth)
│   │   └── validators/        # Zod validation schemas
│   ├── types/                 # Shared TypeScript interfaces
│   └── styles/
│       └── globals.css        # Tailwind styling & tokens
├── middleware.ts              # Next.js authentication & route guard middleware
├── .env.example               # Environment variables template
└── README.md
```

---

## Local Development & Setup

### 1. Prerequisites
- Node.js (v18.17+ or v20+)
- npm, pnpm, or yarn
- PostgreSQL database instance

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/annu-creator24t/Tours-Travels.git
cd Tours-Travels

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in your connection credentials:
```bash
cp .env.example .env
```

Key environment variables:
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret key for signing admin JWT session tokens |
| `NEXT_PUBLIC_APP_URL` | Production website base URL (e.g. `https://jaymaasheetalatours.com`) |
| `NEXT_PUBLIC_COMPANY_*` | Centralized business name, phone, WhatsApp, and address |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Optional Razorpay API credentials |
| `SMTP_*` | Optional SMTP configuration for transactional email dispatch |

### 4. Database Setup

#### Local Development
```bash
# 1. Generate Prisma client
npm run prisma:generate

# 2. Run migrations for development
npm run prisma:migrate

# 3. Seed database with realistic fleet catalog, drivers, reviews, and admin user
npm run prisma:seed
```

#### Production Deployment
```bash
# 1. Generate Prisma client
npm run prisma:generate

# 2. Apply pending migrations safely without reset
npm run prisma:deploy
# or: npx prisma migrate deploy
```

> **Connection Pooling Note:** When connecting to PostgreSQL via pooled connections (PgBouncer, Supabase transaction pooler, Neon pooler, AWS RDS Proxy), provide the pooled connection string in `DATABASE_URL`. `npx prisma migrate deploy` applies migrations sequentially and idempotently against your schema.

### 5. Running the Application
```bash
# Start development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

Default credentials after development seeding:
- **Admin Portal:** `http://localhost:3000/admin/login`
- **Email:** `admin@tourstravels.com`
- **Password:** `Admin@123456`

---

## Production Deployment Checklist

1. **Database:** Provision a managed PostgreSQL instance (e.g., Supabase, Neon, AWS RDS, Railway) and run `npm run prisma:deploy` (or `npx prisma migrate deploy`).
2. **Environment:** Set `NEXTAUTH_SECRET` to a strong random 64-character secret and provide `NEXT_PUBLIC_APP_URL`.
3. **Build:** Run `npm run build` to generate the optimized standalone Next.js bundle.
4. **Process Manager:** Deploy to Vercel, Node.js VPS with PM2, or Docker container.

---

## License

Private & Proprietary — © Jay Maa Sheetala Tours & Travel. All rights reserved.

