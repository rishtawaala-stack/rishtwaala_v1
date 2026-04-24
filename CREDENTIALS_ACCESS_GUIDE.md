# Credentials Access Guide

## Purpose

This document explains how the Rishtawaala team should store, share, and use project credentials.

It is intentionally written as an access guide, not a place to paste secrets.

Do **not** put real credentials directly in this file.

## Rule Zero

This Markdown file is for:

- explaining what credentials exist
- explaining where they live
- explaining who should have access
- explaining how to load them into local and production environments

This Markdown file is **not** for:

- Firebase JSON private keys
- database passwords
- API secrets
- payment keys
- SMTP passwords
- JWT secrets

If this file is committed to git, and it contains real secrets, those secrets should be treated as leaked.

## Recommended Storage Model

Use this split:

### 1. Git repository

Keep only:

- documentation
- `.env.example`
- variable names
- setup instructions

Never keep:

- `.env`
- Firebase service-account JSON files
- exported credential backups
- production secrets

### 2. Shared team password/secret manager

Store the actual secret values in a team-controlled secret manager such as:

- `1Password`
- `Bitwarden`
- `LastPass` if that is already the team standard
- cloud secret manager if the team already has one

This should be the main place where authorized team members access shared credentials.

### 3. Local machine

Each developer should keep local secrets only in:

- local `.env`
- OS environment variables
- a secure local folder outside the repo for JSON credential files

### 4. Production host

Production secrets should live in:

- hosting panel environment variables
- deployment secret manager
- server-level environment configuration

They should not be uploaded as ad hoc files unless the platform forces that pattern.

## What Credentials This Project Will Likely Need

For the current architecture, the project will likely need at least these categories:

### Firebase / Google

- Firebase web config values
- Firebase Admin service-account credentials
- Google Cloud project ID

### Backend app

- app JWT secret if backend-issued sessions are used
- CORS origins
- environment mode values

### Database

- `DATABASE_URL`

### Payments

- Razorpay keys
- Stripe secret keys
- Stripe webhook secret

### Storage / third-party services

- any media storage secrets
- notification provider credentials
- email provider credentials

## Credential Classification

Use these three classes.

## Class A: Public-ish frontend config

These are usually safe to expose to the frontend bundle, but should still be managed carefully.

Examples:

- Firebase `apiKey`
- Firebase `authDomain`
- Firebase `projectId`
- Firebase `storageBucket`
- Firebase `messagingSenderId`
- Firebase `appId`

Important:

- these are not the same as server secrets
- they can exist in frontend env vars
- they still should not be randomly pasted across chats and documents

## Class B: Server-only secrets

These must never go to the frontend.

Examples:

- Firebase Admin private key
- database password
- payment secret keys
- webhook secrets
- app JWT secret

## Class C: Restricted operational credentials

These should be limited to only a few people.

Examples:

- production Firebase Admin JSON
- production database root/admin access
- production billing/admin console access
- payment dashboard owner credentials

## Recommended Folder and File Pattern

Inside the repo:

```text
Rishtawaala/
  CREDENTIALS_ACCESS_GUIDE.md
  backend/
    .env.example
```

Outside the repo, on each developer machine:

```text
C:\secure\rishtawaala\
  firebase-admin-dev.json
  firebase-admin-staging.json
  firebase-admin-prod.json
```

Do not place the JSON files under the project folder.

## Recommended `.gitignore` Rules

Make sure git ignores files like:

- `.env`
- `.env.*`
- `*.json` credential exports if stored near the repo by mistake
- any `service-account` file names

Recommended examples:

```gitignore
.env
.env.*
service-account*.json
firebase-admin*.json
```

If you want stricter control, limit JSON ignores to exact credential naming patterns so normal project JSON files are not hidden unintentionally.

## Team Access Model

Use role-based access.

### Developers

Should have access to:

- dev Firebase project
- dev `.env` values
- local testing credentials

Should not automatically have access to:

- prod billing/admin credentials
- prod payment dashboard owner credentials

### Tech lead / deployment owner

Should have access to:

- staging credentials
- production deployment secrets
- Firebase Admin production credentials
- hosting panel secrets

### Finance / operations owner

Should have access to:

- payment dashboards
- billing consoles

They do not necessarily need backend deployment secrets.

## Firebase Credentials: What to Store Where

## Frontend Firebase config

Store these in frontend environment variables:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

These can be shared with developers who work on the frontend.

## Backend Firebase Admin credentials

Use one of these patterns.

### Pattern A: JSON key file

Store the downloaded Firebase Admin JSON file:

- outside the repo
- in a secure local folder
- in a secret manager-backed deployment process for production

Then reference it with:

```env
GOOGLE_APPLICATION_CREDENTIALS=C:\secure\rishtawaala\firebase-admin-dev.json
GOOGLE_CLOUD_PROJECT=rishtawaala-dev
```

### Pattern B: Expanded env vars

Instead of storing the JSON file on the server, store these values as env vars:

```env
FIREBASE_PROJECT_ID=rishtawaala-prod
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
GOOGLE_CLOUD_PROJECT=rishtawaala-prod
```

Important for `FIREBASE_PRIVATE_KEY`:

- multiline private keys often need newline escaping in env vars
- backend code usually needs `.replace(/\\n/g, "\n")`

## Which Pattern to Choose

Use:

- `Pattern A` for simple local development
- `Pattern B` for most hosting panels and cloud deployments

## Suggested Shared Secret Entries

In your team secret manager, create separate entries such as:

- `Rishtawaala / Firebase / Dev / Web Config`
- `Rishtawaala / Firebase / Dev / Admin SDK`
- `Rishtawaala / Firebase / Staging / Web Config`
- `Rishtawaala / Firebase / Staging / Admin SDK`
- `Rishtawaala / Firebase / Prod / Web Config`
- `Rishtawaala / Firebase / Prod / Admin SDK`
- `Rishtawaala / Backend / Dev / Env`
- `Rishtawaala / Backend / Prod / Env`
- `Rishtawaala / Payments / Prod / Razorpay`
- `Rishtawaala / Payments / Prod / Stripe`

This is much cleaner than keeping one giant note with all credentials mixed together.

## What to Put in `.env.example`

The repo should include variable names only, for example:

```env
NODE_ENV=development
PORT=8080
WEB_BASE_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

DATABASE_URL=

GOOGLE_CLOUD_PROJECT=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

JWT_ISSUER=
JWT_AUDIENCE=
APP_JWT_SECRET=
```

`.env.example` should document the shape of configuration, but not contain real values.

## How Team Members Should Access Credentials

Recommended onboarding flow:

1. developer is added to the team secret manager
2. developer receives access only to the relevant environment
3. developer copies secrets into local `.env`
4. developer stores any JSON key outside the repo
5. developer verifies the app starts locally

Do not onboard by:

- sending raw secrets in WhatsApp
- sending secrets in email threads
- pasting secrets into markdown docs
- committing `.env` to git

## How to Share Credentials Safely

Safe-ish sharing methods:

- team secret manager
- hosting platform secret UI
- encrypted company vault

Unsafe methods:

- plaintext in repo
- plaintext in shared Google Docs
- screenshots of secret pages
- chat messages with full keys

## How to Rotate Credentials

If a credential leaks or a team member leaves:

1. create replacement credential
2. update secret manager
3. update deployment environment
4. update local developer access if required
5. revoke old credential
6. record the date of rotation

Apply this especially to:

- Firebase Admin private keys
- database passwords
- payment secrets
- JWT secrets

## Production-Specific Rules

- production secrets should be accessible only to a limited group
- production Firebase Admin credentials should not be downloaded casually by every developer
- payment secrets should be restricted further than normal app config
- billing console access should be tightly limited

## Suggested Credential Register Template

Use this template in your internal password manager or ops docs.

```text
Name:
Environment:
Owner:
Used by:
Where stored:
Rotation owner:
Last rotated:
Notes:
```

Example:

```text
Name: Firebase Admin SDK
Environment: Production
Owner: Engineering
Used by: Backend API
Where stored: Hosting secrets + team vault
Rotation owner: Tech lead
Last rotated: 2026-04-24
Notes: Do not store JSON in repo
```

## What This Repo Should Do Next

To support this process cleanly, the repo should eventually include:

1. an updated `backend/.env.example`
2. Firebase-based backend env variable names
3. `.gitignore` coverage for local secret files
4. Firebase Admin setup instructions for the backend

## Final Recommendation

The correct pattern is:

- documentation in repo
- secrets in a secret manager
- local `.env` per developer
- production secrets in deployment environment
- Firebase Admin credentials kept server-only

Do not use Markdown as the storage location for actual credentials. Use Markdown only as the map.
