# rishtawaala Backend Architecture

## 1. Objective

This document defines the backend structure for `rishtawaala.com` using `Node.js`, `Express.js`, `PostgreSQL 15+`, and Supabase-compatible auth/storage patterns.

The backend should be:

- secure by default
- modular
- scalable
- strict about validation and authorization
- aligned with the existing [schema.sql](/C:/Users/ARIN/OneDrive/Desktop/Rishtawaala/schema.sql)

This API layer should sit between clients and the database for all sensitive business actions.

## 2. High-Level Architecture

Recommended model:

- `Supabase Auth` for identity
- `Express API` for business logic
- `PostgreSQL` as the primary datastore
- `Supabase Storage` for media and documents
- `Redis` for rate limiting, caching, and counters
- `BullMQ` workers for async jobs

Request flow:

1. Client authenticates with Supabase Auth.
2. Client sends bearer token to Express.
3. Express verifies token.
4. Express loads actor context from `users`, `profiles`, `subscriptions`.
5. Express validates input.
6. Express enforces authorization, privacy, and plan limits.
7. Express executes service-layer logic.
8. Express writes to the database in transactions when required.
9. Express emits notifications, audit logs, and jobs.

## 3. Core Principles

- Thin routes, fat services
- Transactions for multi-step state changes
- Centralized validation
- Explicit authorization policies
- Server-authoritative pricing and entitlements
- DTO-based response shaping
- Security and privacy enforced in backend, not only frontend

## 4. Recommended Project Structure

```text
backend/
  src/
    app.js
    server.js
    config/
    routes/
    controllers/
    services/
    repositories/
    middleware/
    validators/
    policies/
    jobs/
    utils/
    docs/
  tests/
    unit/
    integration/
    e2e/
```

Recommended route files:

- `auth.routes.js`
- `users.routes.js`
- `profiles.routes.js`
- `media.routes.js`
- `preferences.routes.js`
- `privacy.routes.js`
- `search.routes.js`
- `matches.routes.js`
- `interests.routes.js`
- `conversations.routes.js`
- `messages.routes.js`
- `notifications.routes.js`
- `subscriptions.routes.js`
- `payments.routes.js`
- `boosts.routes.js`
- `referrals.routes.js`
- `verifications.routes.js`
- `reports.routes.js`
- `admin.routes.js`
- `rm.routes.js`
- `public.routes.js`
- `health.routes.js`

## 5. Technology Choices

- Runtime: `Node.js 22 LTS`
- Framework: `Express.js 5`
- Validation: `zod`
- Logging: `pino`
- Database client: `pg` preferred for SQL control
- Rate limiting: `express-rate-limit` with Redis backing
- Security middleware: `helmet`, `cors`, `hpp`
- Jobs: `BullMQ`

## 6. Environment Variables

```env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgres://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWKS_URL=https://xxx.supabase.co/auth/v1/.well-known/jwks.json
REDIS_URL=redis://...
JWT_ISSUER=https://xxx.supabase.co/auth/v1
JWT_AUDIENCE=authenticated
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
SENTRY_DSN=...
```

Never expose service-role or payment secrets to the client.

## 7. Authentication Strategy

Use `Supabase Auth` for phone OTP, email, Google, and Apple sign-in.

Every protected Express route should:

1. extract bearer token
2. verify signature, issuer, audience, and expiry
3. load `users` row
4. reject blocked or inactive accounts
5. load `profiles` row when needed
6. attach actor context to `req.auth`

Recommended `req.auth` shape:

```js
req.auth = {
  authUserId: 'uuid',
  userId: 'uuid',
  profileId: 'uuid',
  plan: {
    code: 'gold',
    expiresAt: '2026-08-01T00:00:00Z'
  },
  adminRole: null
}
```

Admin access must never trust role flags from the frontend. Admin tokens must map to `admin_users`.

## 8. Authorization Model

Main access levels:

- public
- authenticated user
- profile owner
- matched participant
- premium user
- gold user
- platinum user
- relationship manager
- moderator
- superadmin

Core rules:

- users edit only their own profile
- users can access only conversations they belong to
- users can message only when entitlement and conversation state allow it
- admin tables are inaccessible to normal users
- blocked users cannot interact
- incognito users must not create profile-view records

## 9. API Conventions

Base path:

`/api/v1`

Success response:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error response:

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

Use cursor pagination for messages, notifications, matches, views, and admin queues.

Require `Idempotency-Key` for payment-sensitive routes.

## 10. Route Design

All routes below are prefixed with `/api/v1`.

## 10.1 Health

### `GET /health`

- liveness probe
- public

### `GET /health/ready`

- readiness probe for db, redis, queues
- internal/admin only

## 10.2 Auth

### `GET /auth/me`

- verify current token
- return actor summary, profile status, plan status

### `POST /auth/session/verify`

- explicit token verification endpoint for clients that need session bootstrap

### `POST /auth/logout`

- optional logout hooks, token invalidation bookkeeping, device/session cleanup

## 10.3 Users

### `GET /users/me`

- account-level view from `users`

### `PATCH /users/me`

- update safe account fields only
- must never allow `verified_level`, `is_blocked`, `is_active`

### `DELETE /users/me`

- soft closure flow
- mark account inactive
- hide profile
- revoke or expire app sessions where possible
- enqueue cleanup tasks

## 10.4 Profiles

### `POST /profiles`

- create first profile
- one profile per user
- validate mandatory fields
- create default `privacy_settings`
- create default `partner_preferences`
- create `screening_queue` entry

### `GET /profiles/me`

- owner edit view

### `PATCH /profiles/me`

- update own profile
- recalculate completeness
- trigger re-screening when sensitive fields change
- optionally set `is_visible = false` until moderator approval

### `GET /profiles/:profileId`

- view another profile
- apply privacy masking
- remove hidden fields based on settings, plan, accepted state, and blocks

### `POST /profiles/me/activate`

- reactivate own profile if allowed

### `POST /profiles/me/deactivate`

- hide own profile from discovery

### `GET /profiles/me/completeness`

- return completion percentage and missing-field checklist

## 10.5 Family Details

### `GET /profiles/me/family`

### `PUT /profiles/me/family`

- owner only
- upsert `family_details`

## 10.6 Horoscope

### `GET /profiles/me/horoscope`

### `PUT /profiles/me/horoscope`

### `GET /profiles/:profileId/horoscope`

- owner always allowed
- others only when privacy setting allows
- horoscope document access must use short-lived signed URLs

## 10.7 Media

### `POST /media/upload-url`

- generate signed upload URL
- validate mime type, size, and media category
- choose controlled storage path

### `POST /media`

- register uploaded media row after successful upload

### `PATCH /media/:mediaId`

- reorder media
- mark primary photo

### `DELETE /media/:mediaId`

- delete own media
- do not allow deletion if it violates minimum-photo policy

### `GET /profiles/:profileId/media`

- return visible media after privacy and entitlement checks

## 10.8 Preferences

### `GET /profiles/me/preferences`

### `PUT /profiles/me/preferences`

- owner only
- validate ranges, enums, and arrays

## 10.9 Privacy

### `GET /profiles/me/privacy`

### `PUT /profiles/me/privacy`

- owner only
- `incognito_mode` allowed only for platinum
- validate `hide_from_ids` length and UUID format

## 10.10 Search

### `GET /search/profiles`

Supported filters:

- age
- height
- religion
- caste
- city
- state
- country
- education
- income
- diet
- NRI flags

Rules:

- only active and visible profiles
- exclude self
- exclude blocked and hidden relations
- free tier may receive reduced detail or blurred media metadata

### `GET /search/saved`

### `POST /search/saved`

### `PATCH /search/saved/:id`

### `DELETE /search/saved/:id`

- saved-search quota depends on plan

## 10.11 Matches

### `GET /matches`

- list computed matches for current user
- support `preferred`, `broader`, `reverse`, `kundali`, `ai`

### `POST /matches/refresh`

- queue recalculation request
- heavily throttled

### `GET /matches/:matchId`

- fetch one match row if owner is involved

### `POST /matches/:matchId/feedback`

- capture ignore or decline reasons into `match_feedback`

## 10.12 Interests

### `GET /interests/incoming`

### `GET /interests/outgoing`

### `POST /interests`

- send like, shortlist, or block-style interaction
- enforce daily limit by plan
- prevent self-targeting
- prevent invalid duplicate states

### `PATCH /interests/:id`

- accept
- decline
- ignore

Accept flow should be transactional:

1. update interest state
2. mark mutual state if applicable
3. create conversation if absent
4. create notifications
5. emit realtime events if needed

## 10.13 Profile Views

### `GET /profiles/me/views`

- gold+ feature
- incognito viewers do not appear

### `POST /profiles/:profileId/view`

- record a view unless viewer is incognito
- throttle repeated spam views

## 10.14 Conversations

### `GET /conversations`

### `GET /conversations/:conversationId`

### `POST /conversations`

- only if mutual interest or another allowed rule exists

### `PATCH /conversations/:conversationId`

- archive or block

## 10.15 Messages

### `GET /conversations/:conversationId/messages`

### `POST /conversations/:conversationId/messages`

Rules:

- participant only
- active conversation only
- plan must allow messaging
- max length and attachment controls
- optional content moderation hooks

### `POST /messages/:messageId/read`

- recipient marks message as read

## 10.16 Contact Unlocks

### `POST /contacts/unlock`

- unlock contact details
- enforce plan or credit entitlement
- enforce monthly quota
- prevent duplicate charging/unlocking
- log row in `contact_unlocks`

### `GET /contacts/unlocks/me`

- list current user unlock history

## 10.17 Secure Connect

### `POST /secure-connect/sessions`

- platinum only
- create masked-call session without exposing real phone numbers

### `GET /secure-connect/sessions`

### `PATCH /secure-connect/sessions/:id`

- update call status

## 10.18 Notifications

### `GET /notifications`

### `POST /notifications/:id/read`

### `POST /notifications/read-all`

- owner only

## 10.19 Subscriptions

### `GET /subscriptions/plans`

- list active plans and features

### `GET /subscriptions/me`

- current and historical subscriptions

### `POST /subscriptions/checkout`

- create payment order
- price and plan mapping must come only from backend

### `POST /subscriptions/activate`

- finalize activation
- prefer webhook-backed activation

### `POST /subscriptions/cancel`

- cancel auto renew or future renewal

## 10.20 Payments

### `POST /payments/webhooks/razorpay`

### `POST /payments/webhooks/stripe`

- verify signature
- require raw request body handling
- reject replayed or duplicate events

### `GET /payments/me`

- current user payment history only

## 10.21 Boosts

### `POST /boosts`

- activate profile boost
- check plan allowance or purchase entitlement

### `GET /boosts/me`

### `GET /boosts/me/stats`

- view boost history, impressions, and clicks

## 10.22 Referrals

### `POST /referrals`

### `GET /referrals/me`

- normalize phone numbers
- prevent self-referral
- prevent duplicate active referral for same number by same user

## 10.23 Verifications

### `POST /verifications`

- submit verification material
- supported types: phone, email, photo, government_id, income, education

### `GET /verifications/me`

- owner sees only own verification rows

## 10.24 Reports

### `POST /reports`

- report abuse, spam, fake profile, fraud, harassment
- rate limited
- cannot report self

### `GET /reports/me`

- list reports submitted by current user

## 10.25 RM Routes

### `GET /rm/me/clients`

### `PATCH /rm/assignments/:id`

- internal RM workflow only

## 10.26 Admin Routes

All admin routes require admin authentication and audit logging.

### `GET /admin/dashboard`

### `GET /admin/profiles/screening`

### `PATCH /admin/profiles/screening/:id`

- approve
- reject
- request changes

### `GET /admin/reports`

### `PATCH /admin/reports/:id`

### `GET /admin/verifications`

### `PATCH /admin/verifications/:id`

### `POST /admin/users`

### `GET /admin/audit-logs`

### `POST /admin/profiles/:profileId/block`

### `POST /admin/profiles/:profileId/unblock`

### `POST /admin/success-stories`

### `PATCH /admin/success-stories/:id`

## 10.27 Public Routes

### `GET /public/success-stories`

### `GET /public/plans`

### `GET /public/communities/:slug`

Public routes must return only approved, non-sensitive, curated content.

## 11. Service Layer Responsibilities

### Auth Service

- verify JWTs
- load actor context
- resolve admin identity
- reject blocked/inactive accounts

### Profile Service

- create and update profiles
- calculate completeness
- apply visibility and masking rules
- trigger screening when needed

### Media Service

- signed upload URL generation
- storage path rules
- mime and size checks
- signed private asset access

### Matching Service

- query precomputed matches
- queue recomputation
- preference scoring
- kundali score handling
- feedback capture

### Interest Service

- interest lifecycle
- quota enforcement
- dedupe rules
- conversation creation on mutual accept

### Messaging Service

- conversation access checks
- send/read message logic
- anti-spam and moderation hooks

### Subscription Service

- active plan lookup
- feature resolution
- quota calculation
- entitlement helper methods

### Payment Service

- order creation
- webhook verification
- payment reconciliation
- subscription activation and refund flows

### Admin Service

- screening
- verification review
- report handling
- audit logging
- dashboard metrics

## 12. Security Design

### 12.1 Input Validation

Validate every body, query, param, and critical header.

Reject:

- malformed UUIDs
- oversized payloads
- unsupported enum values
- impossible ranges
- unknown fields on strict endpoints

### 12.2 Output Filtering

Never expose:

- service-role values
- raw storage paths
- internal moderation notes to normal users
- internal audit data
- hidden contact data
- raw payment gateway metadata unless needed

### 12.3 Rate Limiting

Rate-limit by IP and authenticated actor where possible.

Sensitive routes:

- auth verification
- profile creation
- interests
- messages
- reports
- upload URL creation
- checkout routes

### 12.4 Abuse Prevention

Protect against:

- bot signups
- mass scraping
- message spam
- repeated contact unlocking
- report flooding

Controls:

- Redis-backed counters
- suspicious-action throttles
- CAPTCHA on abuse patterns
- repeated-action cooldowns
- anomaly review jobs

### 12.5 Upload Security

- whitelist mime types
- validate extension and mime agreement
- enforce size caps by media category
- randomize storage filenames
- never allow executable files
- use signed URLs, not open bucket paths

### 12.6 Webhook Security

- verify signatures
- preserve raw request body
- make handlers idempotent
- store or dedupe by gateway event id

### 12.7 Secrets

- environment or secret manager only
- never log secrets or tokens
- rotate credentials
- separate dev, staging, and prod keys

### 12.8 Transport

- HTTPS only
- HSTS at edge
- strict CORS allowlist
- security headers via `helmet`

### 12.9 Database Security

- least-privilege DB credentials
- parameterized SQL only
- service-role key only on trusted backend
- RLS still recommended if any direct Supabase access remains

### 12.10 Audit Logging

Audit all sensitive admin actions:

- approve
- reject
- block
- unblock
- verification decisions
- report actions
- RM assignments

Also log high-risk user actions:

- contact unlock
- subscription activation
- payment confirmation
- secure-connect initiation

## 13. Privacy Rules

This platform handles sensitive personal data. Privacy must be enforced as core business behavior.

Sensitive categories:

- phone numbers
- email addresses
- family details
- photos and videos
- government id documents
- income details
- horoscope details
- location information

Backend privacy rules:

- owner view and public view must use separate DTOs
- contact data visible only when privacy and entitlement allow
- horoscope visibility controlled separately
- income visibility controlled separately
- incognito mode suppresses view records
- blocked users must disappear from each other’s interaction flows

## 14. Search and Matching Strategy

### Search

Search should be SQL-driven and index-aware.

Every search query should:

- filter `is_active = true`
- filter `is_visible = true`
- exclude self
- exclude blocked and hidden relations
- sort with business-aware ordering when needed

### Matching

Do not compute full match sets synchronously on every request.

Recommended triggers for recomputation:

- profile create
- profile update
- preference update
- moderator approval
- scheduled refresh

Store results in `matches` and read from there.

### Kundali

Keep kundali computation isolated in a dedicated service. If it grows complex, move it to a worker or separate domain module.

## 15. Messaging Design

Access rules:

- only `profile_a` or `profile_b` may read a conversation
- only participants may send messages
- messaging requires active conversation and proper entitlement

Safety rules:

- max message length
- abuse/profanity scanning hooks
- repeated-message spam detection
- attachment restrictions

Realtime model:

- Express authorizes writes
- DB commit succeeds
- notification/realtime event emitted after commit

## 16. Subscription and Entitlements

The backend must be server-authoritative.

Frontend must never decide:

- current plan
- quotas
- pricing
- premium access

Implement an entitlement helper like:

`resolveEntitlements(profileId)`

Expected output:

- current plan code
- expiry
- daily interest limit
- monthly contact unlock limit
- can message
- can see profile views
- can use incognito
- boosts remaining

## 17. Admin and Moderation

### Screening Queue

When triggered:

1. insert or update queue row
2. hide profile if policy requires
3. notify moderators
4. write audit trail when reviewed

### Reports

Reports must support:

- triage
- status progression
- reviewer assignment
- final action notes

### Verifications

Only admins can approve or reject verification documents.

## 18. Error Handling

Use centralized error middleware.

Standard error codes:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `RATE_LIMITED`
- `FEATURE_NOT_AVAILABLE`
- `PAYMENT_FAILED`
- `INTERNAL_ERROR`

Never leak SQL text, secrets, or production stack traces.

## 19. Observability

Track per request:

- request id
- route
- actor id if available
- status code
- latency

Recommended metrics:

- signup completion rate
- screening turnaround time
- search latency
- interest volume
- conversation creation count
- payment success rate
- moderation queue size

Use Sentry or similar for error tracking.

## 20. Testing Strategy

### Unit Tests

- validators
- policy checks
- entitlement logic
- scoring logic

### Integration Tests

- routes with database
- auth middleware
- transaction behavior
- webhook verification

### E2E Tests

Critical flows:

1. register -> create profile -> screening
2. search -> interest -> accept -> conversation -> message
3. checkout -> webhook -> subscription activation
4. report -> moderator review -> action

## 21. Recommended Build Order

1. auth middleware and `GET /auth/me`
2. profile create/read/update
3. preferences and privacy
4. media upload and registration
5. search
6. interests
7. screening workflow
8. conversations and messages
9. subscriptions and payments
10. notifications
11. reports and verifications
12. admin APIs
13. boosts, referrals, RM, secure connect

## 22. Non-Negotiable Checklist

- verify every JWT on the server
- never trust client-supplied prices
- never expose raw document URLs
- rate limit sensitive routes
- parameterize every query
- use transactions for critical flows
- audit all admin actions
- keep service-role key server-only
- enforce privacy masking in serializers
- implement idempotency for payments and unlocks

## 23. Final Recommendation

The most practical backend structure for this product is:

- Supabase Auth for identity
- Express.js for all business logic
- PostgreSQL for data integrity and indexed search
- Redis and BullMQ for quotas, jobs, and throttling
- strict policy-based authorization
- DTO-based privacy enforcement

That architecture is simple enough for MVP delivery and strong enough for a trust-sensitive matrimony product.
