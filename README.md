# rishtawaala Server

Production-oriented `Node.js + Express.js` backend scaffold for the rishtawaala platform.

## Included

- versioned API under `/api/v1`
- domain route structure aligned to the backend architecture doc
- security middleware with `helmet`, `cors`, `hpp`, rate limiting, compression
- centralized request context and logging
- browser-aware `404` and `500` redirects
- JSON error responses for API consumers
- graceful shutdown handling
- environment template

## Quick Start

1. Copy `.env.example` to `.env`
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm run dev
```

## Route Examples

- `GET /health`
- `GET /api/v1/auth/me`
- `GET /api/v1/profiles/me`
- `GET /api/v1/search/profiles`
- `GET /api/v1/subscriptions/plans`

Protected routes currently expect:

```http
Authorization: Bearer <token>
```

Admin routes also expect:

```http
X-Admin-Role: superadmin
```

## Error Handling

- API clients receive JSON `404` and `500` responses
- browser requests are redirected to:
  - `/errors/404`
  - `/errors/500`

## Important

This scaffold is production-oriented in structure and middleware, but the domain handlers are still stubbed and must be connected to:

- PostgreSQL repositories
- Supabase JWT verification
- payment gateways
- storage signing
- moderation and matching services

The architecture reference remains in [backend-architecture.md](/C:/Users/ARIN/OneDrive/Desktop/Rishtawaala/backend-architecture.md).
