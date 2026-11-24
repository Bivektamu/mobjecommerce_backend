# Ecommerce Backend

## Stack

- **Language / Runtime**: TypeScript 5.4, Node.js
- **Framework**: Express 4 + Apollo Server 4 (GraphQL over HTTP)
- **Database**: MongoDB via Mongoose 8
- **Key dependencies**: Stripe (payments), AWS S3 (image storage), jsonwebtoken (auth), google-auth-library (Google sign in), bcrypt (password hashing)
- **Package manager**: npm

## Build approach

<TBD, set by /roadmap>

## Commands

```bash
# Install
npm install

# Dev server (nodemon + ts-node on api/index.ts)
npm run dev

# One-off address book migration script
npm run update:addressBook

# Test (none defined)
npm test
```

## ADRs

Stored in `docs/adr/` (none yet).

## Rules

- Everything is TypeScript with strict mode on. Shared types, enums, and interfaces live in `types.ts` at the repo root.
- The backend is a single GraphQL API. Express serves it at `/graphql` via Apollo Server 4 middleware.
- Data access goes through Mongoose models in `dataLayer/schema/`. There is no separate service or repository layer.
- Errors are surfaced as `GraphQLError` with `extensions.code` set to an `ErrorCode` enum member (see `types.ts`).
- Authentication uses JWTs. The access token (15 minutes) is returned to the client; the refresh token (7 days) is stored in an httpOnly cookie at path `/graphql`. Resolvers read the user from `context.auth`.
- Environment variables are read from `process.env` at use time (with `!`), not validated at startup. Secrets live in `.env` (gitignored).
- Product images are uploaded to AWS S3 in `utilities/uploadImage.ts` and deleted via `utilities/deleteImages.ts`.
- There are no tests yet. The `npm test` script is a placeholder that fails.

## Context files

- [gqlSchema/AGENTS.md](gqlSchema/AGENTS.md) — GraphQL type definitions and resolvers
- [dataLayer/AGENTS.md](dataLayer/AGENTS.md) — Mongoose schemas and the DB connection
