# Tours & Travels — Web Platform (V1)

A clean, modern, and high-trust Tours & Travels web application tailored for direct fleet discovery, customer inquiries, verified reviews, and admin booking management.

---

## Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Components & Route Handlers)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database & ORM:** [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
* **Validation:** [Zod](https://zod.dev/)
* **Icons:** [Lucide React](https://lucide.dev/)

---

## Project Structure

```
Tours-Travels/
├── prisma/
│   └── schema.prisma         # Database schema definition
├── public/
│   └── images/               # Static assets & placeholders
├── src/
│   ├── app/
│   │   ├── (customer)/       # Customer pages (Home, Fleet, Booking, Reviews, Contact)
│   │   ├── (admin)/          # Admin operations portal (Dashboard, Fleet, Bookings)
│   │   └── api/              # RESTful API route handlers
│   ├── components/
│   │   ├── ui/               # Reusable UI primitives (Button, Badge, Modal, Input)
│   │   ├── customer/         # Customer layouts and widgets (Navbar, Footer, WhatsApp CTA)
│   │   └── admin/            # Admin layouts and table widgets (Sidebar, Header)
│   ├── lib/
│   │   ├── db.ts             # Singleton Prisma client instance
│   │   ├── auth.ts           # Admin authentication utilities
│   │   └── utils/            # Helper formatters (Currency, Date)
│   ├── types/                # Shared TypeScript definitions (Vehicle, Booking, Payment)
│   └── styles/
│       └── globals.css       # Tailwind CSS & design tokens
├── .env.example              # Environment variables template
├── middleware.ts             # Route guard middleware
├── next.config.mjs           # Next.js configuration
├── package.json              # Project dependencies & scripts
├── tsconfig.json             # TypeScript configuration
└── README.md
```

---

## Local Development Setup

### 1. Prerequisites
* Node.js (v18.17+ or v20+)
* npm / yarn / pnpm
* PostgreSQL database instance

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/annu-creator24t/Tours-Travels.git
cd Tours-Travels

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and configure your database connection:
```bash
cp .env.example .env
```

### 4. Database Setup
```bash
# Generate Prisma Client
npm run prisma:generate

# Run Database Migrations (When PostgreSQL instance is running)
npm run prisma:migrate

# Seed realistic development data (Fleet, Drivers, Reviews, Sample Bookings)
npm run prisma:seed
```

### 5. Running the Application
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the customer website or [http://localhost:3000/admin](http://localhost:3000/admin) to view the admin console.
