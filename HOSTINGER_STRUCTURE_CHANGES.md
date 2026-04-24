# Hostinger Structure Changes

Hostinger is likely rejecting this project because the Node app is nested inside `backend/` instead of being at the repository root.

## What to change

### Option 1: Best for Hostinger

Move the backend app to the repository root so `package.json` sits at the top level.

Change this:

```text
Rishtawaala/
  backend/
    package.json
    .env.example
    src/
  README.md
  schema.sql
```

To this:

```text
Rishtawaala/
  package.json
  .env.example
  src/
  README.md
  schema.sql
```

## Why

Many hosting panels detect a Node.js app only if `package.json` is in the root directory being deployed.

## Also check

- Make sure Hostinger starts the app with `npm start`.
- Make sure the app root in Hostinger is the folder that contains `package.json`.
- If Hostinger does not support Node `22`, change the `engines.node` field to `20.x` or `18.x`.

## If you want to keep `backend/`

Then deploy only the `backend/` folder to Hostinger, not the whole repository root.
