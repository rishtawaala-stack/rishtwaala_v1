# 🌹 Rishtawaala — Backend Server

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Supabase-Auth_%26_Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Redis-7.x-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/BullMQ-Jobs-FF0000?style=for-the-badge&logo=bull&logoColor=white" alt="BullMQ"/>
  <img src="https://img.shields.io/badge/Zod-Validation-3068B7?style=for-the-badge&logo=zod&logoColor=white" alt="Zod"/>
  <img src="https://img.shields.io/badge/Razorpay-Payments-02042B?style=for-the-badge&logo=razorpay&logoColor=white" alt="Razorpay"/>
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe"/>
</p>

> Production-oriented `Node.js + Express.js` backend scaffold for **rishtawaala.com** — a trust-sensitive matrimony platform for the Indian diaspora. Secure by default, modular, scalable, and built for real-world deployment.

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [High-Level Architecture](#high-level-architecture)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [API Overview](#api-overview)
- [Authentication & Authorization](#authentication--authorization)
- [Security Design](#security-design)
- [Subscription & Entitlements](#subscription--entitlements)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Error Handling](#error-handling)
- [Build Order](#build-order)
- [Architecture Reference](#architecture-reference)

---

## 🧾 About the Project

**Rishtawaala** is a modern matrimony platform designed with privacy, security, and trust at its core. It connects individuals and families seeking life partners, with features spanning profile discovery, smart matching, a tiered subscription model, real-time messaging, document verification, and a full admin/moderation panel.

This repository contains the **REST API backend** — the authoritative layer between clients (web/mobile) and the database. All sensitive business logic, authorization, pricing, and entitlements are enforced here.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Runtime** | ![Node.js](https://img.shields.io/badge/Node.js-22_LTS-339933?logo=node.js&logoColor=white) | JavaScript runtime |
| **Framework** | ![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?logo=express&logoColor=white) | HTTP server & routing |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white) | Primary relational datastore |
| **Auth & Storage** | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white) | Identity (OTP/OAuth) & media storage |
| **Cache & Rate Limit** | ![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white) | Caching, rate counters, quotas |
| **Job Queue** | ![BullMQ](https://img.shields.io/badge/BullMQ-FF0000?logo=bull&logoColor=white) | Async background workers |
| **Validation** | ![Zod](https://img.shields.io/badge/Zod-3068B7?logo=zod&logoColor=white) | Schema-first input validation |
| **Logging** | ![Pino](https://img.shields.io/badge/Pino-09B899?logo=pino&logoColor=white) | Structured, high-performance logging |
| **Payments** | ![Razorpay](https://img.shields.io/badge/Razorpay-02042B?logo=razorpay&logoColor=white) ![Stripe](https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white) | Subscription & one-time payments |
| **Security** | `helmet` · `cors` · `hpp` · `express-rate-limit` | HTTP hardening |
| **HTTP Compression** | `compression` | gzip/Brotli response compression |
| **Package Manager** | ![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white) | Dependency management |

---

## 🏗️ High-Level Architecture

```
┌─────────────┐     Bearer Token     ┌──────────────────────────────────┐
│   Client    │ ──────────────────▶  │         Express API Server        │
│ (Web/Mobile)│                      │                                   │
└─────────────┘                      │  1. Verify JWT (Supabase JWKS)    │
                                     │  2. Load actor context            │
       ┌─────────────────────────────│  3. Validate input (Zod)          │
       │                             │  4. Authorize (policy layer)      │
       ▼                             │  5. Execute service logic         │
┌─────────────┐                      │  6. DB transaction if needed      │
│ Supabase    │ ◀────────────────────│  7. Emit notifications/jobs       │
│ Auth        │   identity tokens    └──────────────────┬───────────────┘
└─────────────┘                                         │
                                                        ▼
┌─────────────┐    ┌────────────┐    ┌──────────────────────────────────┐
│  Supabase   │    │   Redis    │    │          PostgreSQL 15+           │
│  Storage    │    │  Cache /   │    │  (Primary Datastore — schema.sql) │
│ (media/docs)│    │  Rate Limit│    └──────────────────────────────────┘
└─────────────┘    └────────────┘
                        │
                        ▼
                 ┌────────────┐
                 │   BullMQ   │
                 │  Workers   │
                 └────────────┘
```

**Request flow:**
1. Client authenticates with **Supabase Auth** (OTP, email, Google, Apple)
2. Client sends `Bearer <token>` to Express
3. Express **verifies** signature, issuer, audience, and expiry
4. Express loads actor context from `users`, `profiles`, `subscriptions`
5. Express **validates** all input with Zod
6. Express **enforces** authorization, privacy rules, and plan limits
7. Express executes service-layer business logic
8. Express writes to PostgreSQL with **transactions** when required
9. Express emits notifications, audit logs, and async jobs

---

## 📁 Project Structure

```
rishtawaala_v1/
├── src/
│   ├── app.js                    # Express app bootstrap
│   ├── server.js                 # HTTP server entry point + graceful shutdown
│   ├── config/                   # Environment config loaders
│   ├── routes/
│   │   ├── index.js              # Master route registry
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── profiles.routes.js
│   │   ├── media.routes.js
│   │   ├── preferences.routes.js
│   │   ├── privacy.routes.js
│   │   ├── family.routes.js
│   │   ├── horoscope.routes.js
│   │   ├── search.routes.js
│   │   ├── matches.routes.js
│   │   ├── interests.routes.js
│   │   ├── conversations.routes.js
│   │   ├── messages.routes.js
│   │   ├── contacts.routes.js
│   │   ├── secure-connect.routes.js
│   │   ├── notifications.routes.js
│   │   ├── subscriptions.routes.js
│   │   ├── payments.routes.js
│   │   ├── boosts.routes.js
│   │   ├── referrals.routes.js
│   │   ├── verifications.routes.js
│   │   ├── reports.routes.js
│   │   ├── rm.routes.js
│   │   ├── admin.routes.js
│   │   ├── public.routes.js
│   │   ├── health.routes.js
│   │   └── error-pages.routes.js
│   ├── controllers/              # Request handlers (thin layer)
│   ├── services/                 # Business logic (fat layer)
│   ├── repositories/             # Database query layer
│   ├── middleware/
│   │   ├── auth.middleware.js         # JWT verification + actor context
│   │   ├── admin-auth.middleware.js   # Admin role enforcement
│   │   ├── validate.middleware.js     # Zod schema validation
│   │   ├── rate-limit.middleware.js   # Redis-backed rate limiting
│   │   ├── request-context.middleware.js  # Request ID + logging context
│   │   ├── error.middleware.js        # Centralized error handler
│   │   └── not-found.middleware.js    # 404 handler
│   ├── validators/               # Zod schemas per domain
│   ├── policies/                 # Authorization policy functions
│   ├── jobs/                     # BullMQ job definitions
│   └── utils/                    # Shared helpers
├── schema.sql                    # Full PostgreSQL schema
├── backend-architecture.md       # Detailed architecture spec
├── .env.example                  # Environment variable template
├── package.json
└── README.md
```

---

## ✨ Core Features

| Feature | Detail |
|---|---|
| **Versioned API** | All endpoints under `/api/v1` |
| **Supabase Auth** | Phone OTP, email, Google, Apple sign-in |
| **Profile Lifecycle** | Create → screen → activate → deactivate → soft-delete |
| **Smart Matching** | Preference-scored, kundali, AI, and reverse matches |
| **Interest System** | Like / shortlist with mutual-accept → conversation creation |
| **Messaging** | Plan-gated conversations with anti-spam hooks |
| **Privacy Controls** | Per-field visibility, incognito mode (platinum), block lists |
| **Media Management** | Signed upload URLs, mime/size validation, private signed access |
| **Subscriptions** | Free / Premium / Gold / Platinum tiers with server-authoritative entitlements |
| **Payments** | Razorpay & Stripe webhook integration with idempotency |
| **Profile Boosts** | Plan-gated boost activations with impression/click stats |
| **Contact Unlocks** | Monthly-quota contact reveal with audit trail |
| **Secure Connect** | Masked-call sessions (platinum) — no real phone exposure |
| **Verifications** | Phone, email, photo, government ID, income, education |
| **Referrals** | Per-user referral tracking with duplicate prevention |
| **Reports & Moderation** | Multi-category abuse reports → screening queue → admin review |
| **Relationship Managers** | RM assignment workflow for premium clients |
| **Admin Panel Routes** | Full CRUD for screening, reports, verifications, blocks, success stories |
| **Rate Limiting** | Redis-backed per-IP and per-actor throttling |
| **Audit Logging** | All sensitive admin and high-risk user actions logged |
| **Graceful Shutdown** | SIGTERM / SIGINT handling with connection draining |
| **Health Checks** | `/health` (liveness) and `/health/ready` (readiness) |

---

## 🌐 API Overview

**Base path:** `/api/v1`

All protected routes require:
```http
Authorization: Bearer <supabase_jwt>
```

Admin routes additionally require:
```http
X-Admin-Role: superadmin
```

### Standard Response Shape

**Success:**
```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": []
  }
}
```

### Route Groups

| Group | Prefix | Description |
|---|---|---|
| Health | `GET /health` | Liveness + readiness probes |
| Auth | `/auth` | Token verify, session, logout |
| Users | `/users/me` | Account management |
| Profiles | `/profiles` | Profile CRUD, completeness, visibility |
| Family | `/profiles/me/family` | Family details upsert |
| Horoscope | `/profiles/me/horoscope` | Horoscope upload & privacy |
| Media | `/media` | Signed upload URLs, media registration |
| Preferences | `/profiles/me/preferences` | Partner preference management |
| Privacy | `/profiles/me/privacy` | Visibility & incognito settings |
| Search | `/search/profiles` | Filtered profile discovery + saved searches |
| Matches | `/matches` | Computed match list + refresh + feedback |
| Interests | `/interests` | Like / accept / decline / ignore |
| Profile Views | `/profiles/me/views` | Who viewed you (Gold+) |
| Conversations | `/conversations` | Conversation list + management |
| Messages | `/conversations/:id/messages` | Send & read messages |
| Contact Unlocks | `/contacts/unlock` | Reveal contact details (quota-gated) |
| Secure Connect | `/secure-connect/sessions` | Masked-call sessions (Platinum) |
| Notifications | `/notifications` | Notification list + read |
| Subscriptions | `/subscriptions` | Plans, active sub, checkout, cancel |
| Payments | `/payments/webhooks` | Razorpay & Stripe webhook receivers |
| Boosts | `/boosts` | Profile boost activation + stats |
| Referrals | `/referrals` | Referral submission + history |
| Verifications | `/verifications` | Submit & view verification documents |
| Reports | `/reports` | Abuse reporting |
| RM | `/rm` | Relationship manager client workflows |
| Admin | `/admin` | Screening, moderation, blocks, audit logs |
| Public | `/public` | Success stories, plans, community pages |

---

## 🔐 Authentication & Authorization

### Actor Context

Every protected route resolves a `req.auth` context:

```js
req.auth = {
  authUserId: 'uuid',     // Supabase auth UID
  userId:     'uuid',     // Internal users table PK
  profileId:  'uuid',     // Active profile ID
  plan: {
    code:      'gold',
    expiresAt: '2026-08-01T00:00:00Z'
  },
  adminRole: null          // 'superadmin' | 'moderator' | null
}
```

### Access Levels

| Level | Who |
|---|---|
| Public | Anyone |
| Authenticated | Valid JWT holder |
| Profile Owner | The profile being accessed belongs to the requester |
| Matched Participant | Both parties have a mutual interest/conversation |
| Premium / Gold / Platinum | Active subscription at the given tier |
| Relationship Manager | RM staff role |
| Moderator | Moderation staff role |
| Superadmin | Full admin access |

### Core Authorization Rules

- Users can only edit their **own** profile
- Users can only read conversations they **belong to**
- Messaging requires **active conversation + plan entitlement**
- Admin routes **never** trust client-supplied role flags
- Blocked users **cannot** interact with each other
- Incognito users **must not** appear in profile view records

---

## 🛡️ Security Design

### Input Validation
Every body, query, param, and critical header is validated with **Zod**. Rejected: malformed UUIDs, oversized payloads, unsupported enum values, impossible ranges, unknown fields.

### Rate Limiting
Redis-backed counters per IP and authenticated actor on:
- Auth verification & profile creation
- Interest sends, messages, reports
- Upload URL generation & checkout

### Upload Security
- MIME type whitelist + extension-MIME agreement check
- Per-category size caps
- Randomized storage filenames
- **Signed URLs only** — no open bucket paths

### Webhook Security
- Signature verification (Razorpay + Stripe)
- Raw request body preserved
- Idempotent handlers with event-ID deduplication

### Transport
- HTTPS only in production
- HSTS at edge
- Strict CORS allowlist
- Security headers via `helmet`

### Database
- Parameterized SQL only — no raw string interpolation
- Least-privilege DB credentials
- Service-role key **never** exposed to clients

### Output Filtering
Never exposes: service-role values, raw storage paths, internal moderation notes, hidden contact data, raw payment metadata.

### Standard Error Codes

| Code | Meaning |
|---|---|
| `UNAUTHORIZED` | Missing or invalid token |
| `FORBIDDEN` | Authenticated but not permitted |
| `VALIDATION_ERROR` | Invalid input |
| `NOT_FOUND` | Resource does not exist |
| `CONFLICT` | Duplicate or state conflict |
| `RATE_LIMITED` | Too many requests |
| `FEATURE_NOT_AVAILABLE` | Plan does not include this feature |
| `PAYMENT_FAILED` | Payment gateway error |
| `INTERNAL_ERROR` | Unexpected server error |

---

## 💳 Subscription & Entitlements

The backend is **100% server-authoritative** — no client-side pricing or plan decisions.

Every plan-gated action resolves entitlements via:

```js
resolveEntitlements(profileId)
// Returns:
{
  plan:                    'platinum',
  expiresAt:               '2026-08-01T00:00:00Z',
  dailyInterestLimit:      30,
  monthlyContactUnlocks:   10,
  canMessage:              true,
  canSeeProfileViews:      true,
  canUseIncognito:         true,  // platinum only
  boostsRemaining:         3
}
```

| Tier | Highlights |
|---|---|
| **Free** | Limited search, no messaging, no profile views |
| **Premium** | Messaging enabled, increased interest quota |
| **Gold** | Profile views ("who viewed you"), extended unlocks |
| **Platinum** | Incognito mode, Secure Connect, full feature access |

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```env
# Application
NODE_ENV=development
PORT=8080
APP_NAME=rishtawaala-server
API_PREFIX=/api/v1
WEB_BASE_URL=http://localhost:3000
ERROR_404_REDIRECT=/errors/404
ERROR_500_REDIRECT=/errors/500

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8080

# Logging
LOG_LEVEL=info

# Rate Limiting
TRUST_PROXY=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200

# Authentication (Supabase)
JWT_ISSUER=https://<project>.supabase.co/auth/v1
JWT_AUDIENCE=authenticated
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
SUPABASE_JWKS_URL=https://<project>.supabase.co/auth/v1/.well-known/jwks.json

# Database
DATABASE_URL=postgres://user:password@host:5432/rishtawaala

# Redis
REDIS_URL=redis://localhost:6379

# Payments
RAZORPAY_KEY_ID=<rzp_key_id>
RAZORPAY_KEY_SECRET=<rzp_key_secret>
STRIPE_SECRET_KEY=<sk_live_...>
STRIPE_WEBHOOK_SECRET=<whsec_...>

# Observability (optional)
SENTRY_DSN=<sentry_dsn>
```

> ⚠️ **Never** commit real secrets. Never log tokens or service-role keys.

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>=22.0.0`
- npm `>=10`
- PostgreSQL `15+` instance (or Supabase project)
- Redis instance (local or managed)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd rishtawaala_v1

# 2. Install dependencies
npm install

# 3. Copy and configure environment
cp .env.example .env
# Edit .env with your actual values

# 4. Run database migrations
# Apply schema.sql to your PostgreSQL instance:
psql -d rishtawaala -f schema.sql

# 5. Start the development server
npm run dev
```

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with hot-reload via `node --watch` |
| `npm start` | Start in production mode |
| `npm run lint` | Run linter (not yet configured) |
| `npm test` | Run test suite (not yet configured) |

---

## 🔧 Error Handling

- **API clients** receive JSON `{ success: false, error: { code, message, details } }`
- **Browser requests** are redirected to:
  - `/errors/404` for not-found errors
  - `/errors/500` for server errors
- Stack traces and SQL errors are **never** leaked in responses
- Centralized error middleware handles all uncaught handler errors

---

## 🏗️ Recommended Build Order

1. Auth middleware + `GET /auth/me`
2. Profile create / read / update
3. Preferences and privacy settings
4. Media upload and registration
5. Search
6. Interests
7. Screening workflow
8. Conversations and messages
9. Subscriptions and payments
10. Notifications
11. Reports and verifications
12. Admin APIs
13. Boosts, referrals, RM, Secure Connect

---

## 📖 Architecture Reference

Full backend specification in [`backend-architecture.md`](./backend-architecture.md)

Full PostgreSQL schema in [`schema.sql`](./schema.sql)

---

## ✅ Non-Negotiable Checklist

- [x] Verify every JWT **on the server**
- [x] Never trust client-supplied prices
- [x] Never expose raw document or storage URLs
- [x] Rate-limit all sensitive routes
- [x] Parameterize every SQL query
- [x] Use transactions for critical multi-step flows
- [x] Audit log all admin actions
- [x] Keep service-role key server-side only
- [x] Enforce privacy masking in response serializers
- [x] Implement idempotency for payments and contact unlocks

---

<p align="center">Built for trust-sensitive matchmaking at scale · rishtawaala.com</p>
