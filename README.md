# FlyCharter — Vuelos Privados en Argentina

FlyCharter is a marketplace platform for booking private flights (planes and helicopters) across Argentina. It connects customers seeking charter flights with verified aircraft operators, featuring dynamic pricing for empty legs, real-time bidding on flight requests, and secure payments via Stripe Connect.

The platform supports both direct offer listings (where operators publish available flights with optional dynamic pricing) and a request-bid system (where customers post their travel needs and operators compete with offers). All payments are processed through Stripe with an 8% platform fee, and integrated chat allows customers and operators to coordinate flight details.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Credentials provider, JWT sessions)
- **Payments**: Stripe Connect (Express accounts)
- **i18n**: next-intl (Spanish + English)
- **UI**: Tailwind CSS v4 + shadcn/ui components
- **Email**: Resend (transactional emails)
- **Data Fetching**: SWR (client-side)
- **Validation**: Zod
- **Testing**: Vitest
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or remote URL)
- Stripe account in test mode

## Installation

```bash
git clone <repo-url>
cd flycharter
npm install
```

## Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:

- `DATABASE_URL` — Your PostgreSQL connection string
- `NEXTAUTH_SECRET` — A random secret for JWT signing
- `STRIPE_SECRET_KEY` — Stripe test secret key (`sk_test_...`)
- `STRIPE_PUBLISHABLE_KEY` — Stripe test publishable key (`pk_test_...`)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `RESEND_API_KEY` — Resend API key for emails

## Database Setup

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stripe Setup

1. Get test keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Install [Stripe CLI](https://stripe.com/docs/stripe-cli) for local webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Project Structure

```
src/
├── app/
│   ├── [locale]/           # i18n-routed pages
│   │   ├── page.tsx        # Home
│   │   ├── aviones/        # Plane listings
│   │   ├── helicopteros/   # Helicopter listings
│   │   ├── oferta/[slug]/  # Offer detail
│   │   ├── solicitar/      # Create flight request
│   │   ├── solicitudes/    # Browse requests
│   │   ├── panel/          # Operator dashboard
│   │   ├── checkout/       # Payment flow
│   │   ├── como-funciona/  # How it works
│   │   ├── operadores/     # Operator landing
│   │   ├── contacto/       # Contact page
│   │   ├── ingresar/       # Login
│   │   └── registrarse/    # Register
│   └── api/                # API routes
│       ├── auth/           # NextAuth + register
│       ├── offers/         # CRUD offers
│       ├── requests/       # CRUD flight requests
│       ├── bids/           # Operator bids
│       ├── stripe/         # Connect, checkout, webhook
│       └── chat/           # Chat messages
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Navbar, Footer
│   ├── home/               # SearchBar, FeaturedOffers
│   ├── offers/             # OfferCard, PricingDisplay, filters
│   └── requests/           # RequestCard
├── i18n/                   # Translations (es.json, en.json)
├── lib/                    # Core utilities
│   ├── prisma.ts           # Prisma client singleton
│   ├── pricing.ts          # Dynamic pricing engine
│   ├── stripe.ts           # Stripe helpers
│   ├── airports.ts         # Argentine airports
│   ├── auth.ts             # NextAuth config
│   ├── validators.ts       # Zod schemas
│   └── utils.ts            # cn(), formatCurrency()
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Seed data
tests/
└── pricing.test.ts         # Pricing engine tests
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest tests |

## Test Accounts

All operators use password: `Test1234!`

| Name | Email | Company | Verified |
|------|-------|---------|----------|
| Carlos Menéndez | carlos@skyfleet.com.ar | SkyFleet Argentina | Yes |
| María Rodríguez | maria@helitours.com.ar | Helitours Patagonia | Yes |
| Jorge Alvarez | jorge@australjets.com.ar | Austral Jets | No |
