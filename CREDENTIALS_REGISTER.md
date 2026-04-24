# Credentials Register

## Purpose

This file is the index of all project credentials.

Use it to track:

- what credentials exist
- which environment they belong to
- who owns them
- where the real value is stored
- when they were last rotated

Do **not** paste actual secret values into this file.

If a real secret is added here, treat it as leaked and rotate it.

## Storage Rule

For every entry below:

- `Secret value` must stay in the team secret manager or hosting secret store
- this file should only contain metadata and references

## Status Legend

- `pending`
- `active`
- `rotated`
- `deprecated`

## Credential Inventory

| Name | Environment | Category | Used By | Secret Value Stored In | Owner | Rotation Owner | Last Rotated | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Firebase Web Config | Dev | Frontend Config | Web App | Team vault entry | Engineering | Tech Lead | TBD | pending | Store apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId |
| Firebase Web Config | Staging | Frontend Config | Web App | Team vault entry | Engineering | Tech Lead | TBD | pending | Separate project from dev/prod |
| Firebase Web Config | Production | Frontend Config | Web App | Team vault entry | Engineering | Tech Lead | TBD | pending | Public-ish config, still keep managed |
| Firebase Admin SDK | Dev | Server Secret | Backend API | Team vault or local secure file | Engineering | Tech Lead | TBD | pending | JSON key or expanded env vars |
| Firebase Admin SDK | Staging | Server Secret | Backend API | Team vault / hosting secret store | Engineering | Tech Lead | TBD | pending | Server-only |
| Firebase Admin SDK | Production | Server Secret | Backend API | Hosting secret store | Engineering | Tech Lead | TBD | pending | Highly restricted access |
| Google Cloud Project Access | Dev | Console Access | Firebase / GCP Console | IAM roles | Engineering | Tech Lead | TBD | pending | Track actual users separately |
| Google Cloud Project Access | Staging | Console Access | Firebase / GCP Console | IAM roles | Engineering | Tech Lead | TBD | pending | Least privilege |
| Google Cloud Project Access | Production | Console Access | Firebase / GCP Console | IAM roles | Engineering | Tech Lead | TBD | pending | Limit to small group |
| Database URL | Dev | Server Secret | Backend API | Team vault | Engineering | Tech Lead | TBD | pending | PostgreSQL connection string |
| Database URL | Staging | Server Secret | Backend API | Hosting secret store | Engineering | Tech Lead | TBD | pending | Separate DB |
| Database URL | Production | Server Secret | Backend API | Hosting secret store | Engineering | Tech Lead | TBD | pending | Separate DB |
| App JWT Secret | Dev | Server Secret | Backend API | Team vault | Engineering | Tech Lead | TBD | pending | Only if backend issues app JWTs |
| App JWT Secret | Staging | Server Secret | Backend API | Hosting secret store | Engineering | Tech Lead | TBD | pending | Rotate on auth changes |
| App JWT Secret | Production | Server Secret | Backend API | Hosting secret store | Engineering | Tech Lead | TBD | pending | Restricted |
| Razorpay Keys | Production | Payment Secret | Payments Backend | Team vault / hosting secret store | Finance + Engineering | Tech Lead | TBD | pending | Server-only |
| Stripe Secret Key | Production | Payment Secret | Payments Backend | Team vault / hosting secret store | Finance + Engineering | Tech Lead | TBD | pending | Server-only |
| Stripe Webhook Secret | Production | Payment Secret | Payments Webhook | Hosting secret store | Engineering | Tech Lead | TBD | pending | Server-only |
| SMTP / Email Provider Credentials | Dev | Server Secret | Backend Notifications | Team vault | Engineering | Tech Lead | TBD | pending | If email service is used |
| SMTP / Email Provider Credentials | Production | Server Secret | Backend Notifications | Hosting secret store | Engineering | Tech Lead | TBD | pending | Restricted |
| Hosting Panel Access | Production | Console Access | Deployment | IAM / password manager | Engineering | Tech Lead | TBD | pending | Limit access |

## Local File References

If a developer must use a local credential file, store only the path reference here, never the contents.

| Developer | Environment | Credential | Local Path | Notes |
|---|---|---|---|---|
| Example: Arin | Dev | Firebase Admin SDK | `C:\secure\rishtawaala\firebase-admin-dev.json` | Keep outside repo |

## Environment Variable Map

Use this section to track variable names only.

### Frontend

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Backend

```env
NODE_ENV=
PORT=
WEB_BASE_URL=
CORS_ORIGINS=
DATABASE_URL=
GOOGLE_CLOUD_PROJECT=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
JWT_ISSUER=
JWT_AUDIENCE=
APP_JWT_SECRET=
```

## Access Policy

- Developers should get `dev` access by default
- `staging` access should be limited to active engineering contributors
- `production` access should be limited to a small set of owners
- payment secrets should have stricter access than normal app config
- Firebase Admin production credentials should remain server-only

## Change Log

| Date | Change | By |
|---|---|---|
| 2026-04-24 | Initial credentials register created | Codex |

