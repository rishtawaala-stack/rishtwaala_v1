# Firebase Auth Setup for Rishtawaala

## Purpose

This document explains, in detail, what to configure in:

- `Google Cloud Console`
- `Firebase Console`

to use `Firebase Authentication` for Rishtawaala.

This guide assumes:

- the app will use `Firebase Auth`
- Google sign-in is required
- the backend is a custom `Node.js + Express` API
- the backend will verify Firebase ID tokens
- the backend will still own business authorization, profiles, subscriptions, admin roles, and local user records

## Recommended Setup for This Project

For this codebase, the recommended auth model is:

1. use `Firebase Authentication`
2. enable `Google` sign-in
3. optionally enable `Phone` later if onboarding needs it
4. frontend signs users in with Firebase
5. frontend sends Firebase ID token to backend
6. backend verifies the Firebase ID token
7. backend loads or creates local `users` and `profiles` records
8. backend enforces all app-level authorization

This fits the current repo better than bare Google OAuth because the existing backend architecture already assumes a provider-issued JWT model.

## What Firebase Handles vs What Your Backend Handles

### Firebase handles

- Google sign-in UI/flow
- sign-in state
- provider identity
- ID token issuance
- refresh/session infrastructure
- optional phone auth

### Your backend still handles

- local account creation
- user/profile mapping
- blocked/inactive account rules
- admin roles
- subscription and entitlement checks
- protected API authorization
- app-specific audit and moderation logic

Firebase is the identity provider, not the full business authorization layer.

## Current Repo Context

The current repo still reflects an earlier Supabase-oriented design:

- [`backend-architecture.md`](./backend-architecture.md)
- [`backend/src/config/env.js`](./backend/src/config/env.js)
- [`backend/src/middleware/auth.middleware.js`](./backend/src/middleware/auth.middleware.js)

Notably:

- the auth middleware is still a stub
- environment variables still mention `SUPABASE_*`
- real token verification is not implemented yet

That is good news: auth is still early enough that switching now is relatively cheap.

## High-Level Console Setup Order

Use this order:

1. create Google Cloud project
2. add Firebase to that project
3. register web app in Firebase
4. enable Firebase Authentication
5. enable Google sign-in provider
6. configure authorized domains
7. verify the OAuth/consent screen details in Google Cloud
8. decide whether to enable phone auth
9. create backend service-account access for Admin SDK
10. wire frontend Firebase SDK
11. wire backend Firebase ID token verification

## Part 1: Google Cloud Console Setup

## 1. Create Separate Projects Per Environment

Create separate projects for:

- development
- staging
- production

Suggested names:

- `rishtawaala-dev`
- `rishtawaala-staging`
- `rishtawaala-prod`

Reason:

- isolated credentials
- isolated redirect settings
- safer testing
- easier rollback
- no accidental localhost settings in production

## 2. Create the Google Cloud Project

In `Google Cloud Console`:

1. open the project selector
2. click `New Project`
3. enter the project name
4. choose billing account if needed
5. create the project

Do this once for each environment.

## 3. Review OAuth Branding / Consent Information

Firebase normally manages much of the Google provider flow, but you should still review the Google-side branding and consent configuration because it affects the user-facing sign-in experience and future verification.

In `Google Cloud Console -> APIs & Services -> OAuth consent screen`, configure or confirm:

- App name: `Rishtawaala`
- User support email
- Developer contact email
- Home page URL
- Privacy policy URL
- Terms of service URL
- App logo
- Authorized domains

Recommended authorized domains:

- `rishtawaala.com`
- `www.rishtawaala.com`
- `staging.rishtawaala.com`
- any dedicated auth subdomain if used later

Use `External` audience if public users will sign in with Google accounts.

Important:

- if the app remains in test mode, only test users will be able to use certain flows cleanly
- if scopes expand later, verification requirements may expand too

For basic Google sign-in via Firebase, keep the scope set minimal.

## 4. Do Not Add Unnecessary Google APIs Yet

For simple Firebase Google sign-in, you usually do **not** need to manually enable Gmail, Drive, Calendar, or Contacts APIs.

For this project’s login flow, what matters first is:

- Firebase project
- Firebase Auth enabled
- Google sign-in provider enabled
- valid domains
- correct web app config

## Part 2: Firebase Console Setup

## 5. Add Firebase to the Google Cloud Project

In `Firebase Console`:

1. click `Add project`
2. choose the existing Google Cloud project you created
3. continue setup
4. decide whether to enable Google Analytics for the project

For auth-only setup, Analytics is optional.

If the team does not yet need analytics events, you can leave it disabled initially and add it later.

## 6. Register the Web App

Inside the Firebase project:

1. go to project settings
2. add a web app
3. give it a name such as:
   - `rishtawaala-web-dev`
   - `rishtawaala-web-staging`
   - `rishtawaala-web-prod`
4. register the app
5. copy the Firebase web config snippet

The config will contain values such as:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

These values are meant for the frontend app configuration.

They are not the same thing as a backend secret, but they should still be managed through environment variables and not hard-coded casually.

## 7. Enable Firebase Authentication

In `Firebase Console -> Authentication`:

1. open `Authentication`
2. click `Get started` if it is not already initialized

This activates the auth product for the project.

## 8. Enable Google Sign-In Provider

In `Firebase Console -> Authentication -> Sign-in method`:

1. find `Google`
2. click it
3. enable the provider
4. choose the project support email
5. save

This is the critical step that enables Google login through Firebase.

Per Firebase’s Google sign-in web docs, enabling the Google provider in the Firebase Auth sign-in methods is required before the web SDK flow will work.

## 9. Decide Whether to Enable Phone Auth

If you want phone-based sign-in or recovery later, configure it intentionally.

In `Firebase Console -> Authentication -> Sign-in method`:

1. review `Phone`
2. enable it only if you need it

Important for web phone auth:

- Firebase’s web phone auth uses reCAPTCHA-based app verification
- the hosting domain must be allowed
- localhost is not treated like a hosted production domain for phone auth the same way as normal web login

Do not enable phone auth casually if the product flow has not been designed yet.

For Rishtawaala, it is reasonable to start with:

- `Google`: enabled
- `Phone`: deferred until onboarding/product rules are finalized

## 10. Configure Authorized Domains

In `Firebase Console -> Authentication -> Settings` or the domain-related auth settings area:

add every domain from which sign-in will happen.

Typical entries:

- `localhost`
- `rishtawaala.com`
- `www.rishtawaala.com`
- `staging.rishtawaala.com`

If you later introduce a dedicated auth subdomain, add that too.

This matters because Firebase Auth only allows sign-in flows from authorized domains.

## 11. Decide on Default Auth Domain vs Custom Domain

By default, Firebase commonly uses a domain like:

- `<project-id>.firebaseapp.com`

or project-specific Firebase-hosted auth handling.

This works, but users may briefly see Firebase-hosted domains in redirect-based flows.

If brand consistency matters, you can use a custom domain later.

If you do that, you must ensure:

1. the custom domain is configured in Firebase Hosting
2. the custom domain is authorized
3. the redirect handler path is correctly whitelisted in the Google-side OAuth setup when applicable
4. the frontend Firebase config uses the intended `authDomain`

For initial rollout, the default Firebase domain is acceptable.

## Part 3: Frontend Configuration

## 12. Store Firebase Web Config in Frontend Environment Variables

Recommended frontend env variables:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

If your frontend is not Vite, rename the variables to match the frontend stack.

## 13. Initialize Firebase Auth in the Frontend

Per Firebase’s current web docs, the basic setup is:

1. install Firebase JS SDK
2. initialize the Firebase app
3. initialize `getAuth(app)`
4. create a `GoogleAuthProvider`
5. use `signInWithPopup` or `signInWithRedirect`

For web apps:

- `signInWithPopup` is often simpler on desktop
- `signInWithRedirect` is generally safer on mobile/browser environments where popups are blocked or unreliable

Use minimal scopes unless the product genuinely needs more.

Recommended initial Google scopes:

- default Google identity only

Do **not** add Gmail/Drive/Contacts scopes for simple sign-in.

## 14. Decide Popup vs Redirect

### Use popup if

- your main target is desktop web
- you want simpler implementation during initial development

### Use redirect if

- you expect significant mobile browser usage
- popup blockers or embedded browsers are a concern

For a matrimony platform with mobile-heavy traffic, `redirect` is often the safer default.

## 15. Retrieve Firebase ID Token and Send It to Backend

The official Firebase Admin verification docs recommend:

1. sign the user in on the client
2. get the Firebase ID token from the signed-in user
3. send that token to your backend over HTTPS
4. verify it server-side

That is the right model for this repo.

## Part 4: Backend Configuration

## 16. Install Firebase Admin SDK in the Backend

Your backend will need the Firebase Admin SDK for token verification.

Typical package:

- `firebase-admin`

This SDK is for the server only.

Never bundle it into the frontend.

## 17. Create Service Account Access for the Backend

To verify Firebase ID tokens with the Admin SDK, the backend needs service-account-backed access or equivalent project credentials.

The Firebase Admin verification docs state that ID token verification with the Admin SDK requires a project ID and Admin SDK initialization.

Recommended setup:

1. create a service account tied to the Firebase/Google project
2. grant only the minimum necessary access
3. store credentials securely

Safer options:

- runtime identity on Google-managed infrastructure
- secret manager
- encrypted deployment secrets

Less safe option:

- raw JSON key file on disk

If you use a JSON key:

- keep it out of git
- keep it out of the repo
- reference it through environment/config

## 18. Suggested Backend Environment Variables

For a Node backend, a practical env set is:

```env
GOOGLE_CLOUD_PROJECT=rishtawaala-prod
FIREBASE_PROJECT_ID=rishtawaala-prod
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
JWT_ISSUER=https://securetoken.google.com/rishtawaala-prod
JWT_AUDIENCE=rishtawaala-prod
```

If you load a JSON service account file instead, the exact env structure may differ.

The Firebase verification docs note that the project ID is required for correct ID token verification. The Admin SDK can determine it from explicit app options, service-account credentials, or `GOOGLE_CLOUD_PROJECT`.

## 19. Verify Firebase ID Tokens in Express

Your backend auth flow should be:

1. frontend sends `Authorization: Bearer <firebase-id-token>`
2. Express extracts token
3. Firebase Admin SDK verifies token
4. backend reads `uid`
5. backend finds or creates local user context
6. backend populates `req.auth`

Do not trust raw frontend profile data.

Trust only:

- verified token claims
- your local database state

## 20. Map Firebase Identity to Local Tables

After token verification, map:

- Firebase `uid`
- email
- email verified flag
- provider info

to your local app tables such as:

- `users`
- `profiles`
- subscription records
- admin assignments

Recommended identity key:

- use Firebase `uid` as the stable external identity key

Do **not** use email alone as the permanent identity key.

## 21. Keep Business Authorization Local

Firebase tells you who the user is.
It does not decide:

- whether the user is blocked
- whether the profile is active
- whether they are premium
- whether they may unlock contacts
- whether they are admin

All of that must remain in your backend/business layer.

## Part 5: Production Decisions

## 22. Decide Whether to Keep Only Google or Add Phone Later

For MVP, you can launch with:

- `Google` only

Later, if needed, add:

- `Phone`

This phased approach keeps the first release simpler.

Tradeoff:

- Google-only is easier to implement
- Google-only may reduce signup completion for users who prefer phone onboarding

## 23. Decide on Account Linking Rules Up Front

Before launch, define how the system behaves if the same real person later signs in with multiple methods.

Examples:

- Google today, phone later
- phone today, Google later

Decide:

- whether they merge automatically
- whether they require explicit linking
- which identifier is primary

If you postpone this decision, duplicate-account cleanup becomes harder later.

## 24. Decide Session Ownership Model

There are two valid models.

### Model A: Backend accepts Firebase ID tokens directly

Pros:

- simpler first implementation

Cons:

- every request depends on Firebase token verification
- session control is more tightly coupled to Firebase

### Model B: Backend verifies Firebase token once, then issues app session/JWT

Pros:

- more control over app sessions
- easier to support custom logout/revocation models
- cleaner long-term separation between identity provider and app authorization

Cons:

- slightly more work

For this project, `Model B` is the stronger long-term design.

## Part 6: Security Checklist

## 25. Security Rules for Configuration

- never expose service-account private keys to the frontend
- never commit JSON service-account credentials to git
- store secrets in environment or secret manager
- separate dev/staging/prod projects
- keep sign-in scopes minimal
- authorize only real app domains

## 26. Security Rules for Backend Auth

- verify every Firebase ID token server-side
- reject expired or invalid tokens
- use the verified `uid` only after verification
- never trust client-supplied role, plan, or admin flags
- block users based on local database state, not provider metadata

## 27. Security Rules for Phone Auth

If you enable phone auth later:

- use Firebase’s app verification protections
- understand SMS cost and abuse surface
- do not disable app verification in production
- use fictional phone numbers only for testing, not production

This aligns with Firebase’s current phone auth guidance.

## Part 7: Exact Console Checklist

Use this as the operational setup list.

### Google Cloud Console

- create project
- confirm billing/project ownership
- review OAuth consent screen
- set app name
- set support email
- set developer email
- set privacy policy URL
- set terms URL
- add authorized domains

### Firebase Console

- add Firebase to the project
- register web app
- copy Firebase web config
- enable Authentication
- enable Google sign-in provider
- add authorized domains
- optionally enable Phone sign-in later

### Frontend

- add Firebase SDK
- initialize app
- initialize Auth
- configure GoogleAuthProvider
- choose popup or redirect
- retrieve Firebase ID token
- send token to backend

### Backend

- install `firebase-admin`
- initialize Admin SDK
- configure project ID / credentials
- verify Firebase ID tokens
- map Firebase `uid` to local user
- enforce app authorization from local DB state

## Part 8: Suggested Documentation Follow-Up for This Repo

After console setup, the repo should be updated in these areas:

1. replace Supabase auth assumptions in [`backend-architecture.md`](./backend-architecture.md)
2. replace `SUPABASE_*` env references in [`backend/src/config/env.js`](./backend/src/config/env.js)
3. implement real Firebase token verification in [`backend/src/middleware/auth.middleware.js`](./backend/src/middleware/auth.middleware.js)
4. add first-login user provisioning logic
5. document frontend Firebase initialization

## Suggested Environment Variable Shape

### Frontend

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Backend

```env
GOOGLE_CLOUD_PROJECT=rishtawaala-prod
FIREBASE_PROJECT_ID=rishtawaala-prod
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
JWT_ISSUER=https://securetoken.google.com/rishtawaala-prod
JWT_AUDIENCE=rishtawaala-prod
```

Adjust names to your deployment standards if needed.

## Final Recommendation

For Rishtawaala, the most practical rollout is:

1. Firebase Auth with `Google` enabled now
2. web frontend integrated with Firebase SDK
3. backend verifies Firebase ID tokens with Admin SDK
4. backend maps `uid` to local `users` / `profiles`
5. phone auth added later only if product onboarding requires it

That gives you a solid production path without forcing you to build identity infrastructure from scratch.

## Official References

These are the official sources this setup is based on:

- Firebase Auth web start: https://firebase.google.com/docs/auth/web/start
- Firebase Google sign-in for web: https://firebase.google.com/docs/auth/web/google-signin
- Firebase Admin ID token verification: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- Firebase Auth overview: https://firebase.google.com/docs/auth/
- Firebase web phone auth: https://firebase.google.com/docs/auth/web/phone-auth
- Google Cloud OAuth consent guidance: https://support.google.com/cloud/answer/13461325
- Google web client ID setup: https://developers.google.com/identity/oauth2/web/guides/get-google-api-clientid

