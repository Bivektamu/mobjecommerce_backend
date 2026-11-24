# 0001: Test harness and smoke suite

**Status:** In Progress
**Date:** 2026-09-09

## Summary

Add a Jest test harness that boots the real Express and Apollo server against an in memory MongoDB, then drives the core GraphQL queries and mutations over HTTP with supertest. The suite is the safety net that makes the upcoming restructure (type overhaul, dead code removal, resolver typing, and a service and repository layer) safe to land. External services (Stripe, S3, Google) stay out of the suite so it is fast and deterministic in CI.

## Context

The backend is a single GraphQL API on Express 4 plus Apollo Server 4, with Mongoose 8 on MongoDB. There are no tests today. The `npm test` script is a placeholder that fails. The roadmap schedules a deep restructure across four slices, and none of it is safe without a regression net.

The roadmap row for this feature (Foundation, item 2) sets the goal: a test runner boots the server and hits the core GraphQL queries and mutations, all green and runnable in CI. The project build approach is Tracer Bullet, so the suite must run end to end through every layer (HTTP, Express middleware, resolvers, Mongoose, MongoDB) rather than test resolvers in isolation.

One structural problem must be fixed first. `api/index.ts` calls `startServer()` at module load, which connects to the real MongoDB and listens on port 3000. Tests cannot import that file. The server construction has to be extracted into a builder that tests can import without starting a listener or touching the real database.

The GraphQL surface is known. Auth, user, product, review, wishlist, order, analytics, and payment each expose queries and mutations. Three areas depend on live external services: product create and edit need S3 upload, payment intent creation and lookup need Stripe, and Google sign in needs Google. Orders are only created through Stripe, so there is no Stripe free path to create an order through the API.

## Options considered

Test runner:

- Jest with ts-jest. Chosen. Matches the CommonJS and ts-node setup, has the largest ecosystem, and is stable in CI.
- Vitest. Faster and nicer watch mode, but ESM first and needs more config against this CommonJS build.
- Node built in test runner. Zero dependencies, but weaker mocking and reporting.

Test database:

- mongodb-memory-server. Chosen. Spins up an isolated in memory MongoDB per run, works in CI with no external database, and downloads the binary once.
- Dedicated test MongoDB instance. Fast, but requires running MongoDB in dev and CI.
- Mock the Mongoose models. Fastest, but proves little since the restructure is precisely about the data layer.

How the suite exercises the server:

- Supertest over real HTTP. Chosen. Matches the goal of booting the server, covers cookies and Express middleware, and is closest to production.
- Apollo executeOperation in process. Faster and no port, but skips cookies and middleware.
- Both. A thin HTTP smoke layer plus resolver level tests. Not needed for a smoke suite.

External services (Stripe, S3, Google):

- Exclude them. Chosen. They need live keys and network, the restructure does not touch them, and exclusion keeps CI deterministic.
- Mock them. Covers the whole surface but adds mock code and maintenance.

Order creation in tests:

- Seed orders directly in the test database. Chosen. A helper inserts order documents so order queries and status changes are tested without Stripe.
- Mock Stripe and go through createPaymentIntent. Covers the real creation path but couples the suite to Stripe's client API.

How tests authenticate:

- Use the real register and login mutations. Chosen. Creates a user via createUser, then logs in to get a real token and cookie, exercising the auth path itself.
- Mint JWTs directly with a test secret. Faster, but bypasses the auth logic the suite protects.

CI wiring:

- Add a separate test job. Chosen. Runs npm test after npm ci with the MongoDB binary cached, keeping runs fast.
- Fold the test step into the existing check job. Simpler but slower cache reuse.
- Skip CI. Undercuts the runnable in CI goal.

Isolation:

- Clear the database between test files, seed inside each file. Chosen. Connect once in global setup, wipe collections between files, each file seeds what it needs.
- Fresh in memory database per test file. Cleanest isolation but slower.

Test location:

- A top level tests/ directory. Chosen. Domain folders plus a shared test client and seed helpers, keeping test code out of the source tree.
- Colocate test files next to source. Closer to code but scatters helpers.

Coverage:

- Skip coverage for now. Chosen. This is a smoke suite, not a coverage target.
- Add coverage with a low threshold. A floor against regressions at setup cost.

## Decision

Stand up a Jest plus ts-jest harness that boots the real server via supertest against mongodb-memory-server. Refactor `api/index.ts` to export an app and server builder. Put tests in a top level `tests/` directory with a shared client and seed helpers. Cover the core smoke paths (auth, user, product reads, review, wishlist, seeded order reads and status updates, and analytics), exclude Stripe, S3, and Google, seed orders directly, authenticate through the real register and login mutations, clear the database between test files, and add a separate CI test job with a cached MongoDB binary.

## Rationale

Jest plus ts-jest is the lowest friction runner for a CommonJS TypeScript project that already uses ts-node. mongodb-memory-server gives real integration coverage against the actual database without a standing Mongo dependency, which is exactly what a Tracer Bullet safety net needs, since the restructure touches the data layer. Supertest over HTTP exercises the full stack including cookies and the auth middleware, matching the goal of booting the server. Excluding external services keeps the suite fast and deterministic, and the three excluded surfaces are not touched by the planned restructure. Seeding orders and using the real auth mutations keeps the suite honest about the paths it protects without dragging in Stripe.

## Requirements

Acceptance criteria:

- AC-1: `npm test` runs a Jest suite that boots the real Express and Apollo server against an in memory MongoDB, with no live external services.
- AC-2: The suite exercises the core smoke paths and passes: auth (createUser, logInUser, getAuthStatus, logOutUser, refreshToken, logInAdmin), user (users, user, updateAccount, updateAddressById, userAddresses, deleteAddress), product reads (products, product), review (createReview, productReviews, reviews, editReview, deleteReview), wishlist (addToWishList, wishListByUserId), order (orders, userOrders, orderByNumber, updateOrderStatus on seeded orders), and analytics (orderAnalytics, salesAnalytics, userAnalytics on seeded completed orders).
- AC-3: The suite runs in CI as a separate test job on ubuntu-latest with Node 22, with the MongoDB binary cached, and passes.
- AC-4: The server entry is refactored so tests can import an app and server builder without auto connecting to the production database or listening on a port, while `npm run dev` and `npm start` still work unchanged.
- AC-5: Tests are isolated and deterministic: the database is cleared between test files, each file seeds its own data, and a Jest setup file supplies dummy JWT secrets and any other env vars, with no real secrets used.
- AC-6: The smoke suite stays green through the later restructure slices without changes to its public assertions, proving it is a stable regression net.

## Feature design

Test runner and config:

- Jest with ts-jest as the transformer, configured for the existing CommonJS and strict TypeScript settings. A `jest.config` plus a `jest.setup` file.
- The `jest.setup` file sets dummy JWT access and refresh secrets and any other env vars the resolvers read, so no real secrets are needed and `createJwtTokens` does not throw.
- mongodb-memory-server is started once in a global setup, its URI is wired into Mongoose before the app is created, and it is stopped in global teardown. The binary version is pinned for reproducible CI downloads.

Server refactor:

- Extract the Express app, cookie parser, GraphQL upload, and the Apollo server construction out of `startServer()` into a `createApp()` or `createServer()` builder that returns the app, the Apollo server, and the http server.
- Keep `api/index.ts` as a thin entry that connects to the real database, starts the server, and listens. Tests import the builder instead and never call the entry.

Test structure:

- A top level `tests/` directory with one folder per domain (auth, user, product, review, wishlist, order, analytics).
- A shared `testClient` helper that boots the app and wraps supertest against the `/graphql` endpoint, returning a GraphQL executor that can attach an authorization header.
- Shared seed helpers that create users, products, reviews, wishlist entries, and orders directly through the models or the API.

Scope:

- Auth: register and login, getAuthStatus, logout, refresh token, and admin login.
- User: list, get by id, update account, add and list addresses, delete address.
- Product: read only (list and get by id). Create and edit are excluded because they need S3 upload.
- Review: create, list by product, list all, edit, delete.
- Wishlist: add and list by user.
- Order: seed orders directly, then list, list by user, get by order number, and update status.
- Analytics: seed completed orders, then hit order, sales, and user analytics.

Excluded from the smoke suite:

- createProduct, editProduct (S3 upload), createPaymentIntent, orderByPaymentIntent (Stripe), logInGoogleUser (Google).

Isolation:

- The global setup connects once. A before each hook (or per file hook) clears the collections, and each test file seeds its own data, so tests do not depend on each other or on run order.

Critical test scenarios:

- Auth: a registered user can log in and receive an access token and a refresh cookie (AC-2).
- Auth: an unauthenticated request to getAuthStatus fails with NOT_AUTHENTICATED (AC-2).
- Review: a review created by a user appears in productReviews with the user populated (AC-2).
- Order: a seeded order is returned by orders and userOrders, and its status can be updated (AC-2).
- Isolation: running the suite twice, or in any order, produces the same results (AC-5).

## Build plan

Task order follows Tracer Bullet: stand up one thin end to end slice first, then thicken with the remaining domains.

1. Refactor `api/index.ts` into a `createApp()`/`createServer()` builder, keep the entry thin, and confirm `npm run dev` still boots. Satisfies AC-4.
2. Add Jest, ts-jest, supertest, and mongodb-memory-server as dev dependencies, add the Jest config and global setup/teardown that start the in memory database and set dummy env vars, and point `npm test` at Jest. Satisfies AC-1 and AC-5.
3. Build the shared `testClient` and seed helpers, and write the first end to end smoke test (auth: register then login then getAuthStatus) proving the harness boots the server. Satisfies AC-1 and AC-2.
4. Fill out the auth smoke suite (logout, refresh, admin login, unauthenticated failure). Satisfies AC-2.
5. Write the user, product read, review, and wishlist smoke suites. Satisfies AC-2.
6. Write the order and analytics smoke suites on seeded orders. Satisfies AC-2.
7. Add a separate CI test job with the MongoDB binary cached, and verify the whole suite is green on ubuntu-latest with Node 22. Satisfies AC-3 and AC-6.

## Consequences

Gained:

- A real end to end regression net that runs in CI, making the four restructure slices safe to land.
- An honest test of auth, cookies, and middleware through HTTP, not just resolver logic in isolation.
- Deterministic, fast tests with no external service dependencies.

Traded:

- Jest, ts-jest, supertest, and mongodb-memory-server add dev dependencies and some setup code to maintain.
- The server entry gains a refactor that must stay consistent with the entry point.
- The suite intentionally does not cover Stripe, S3, or Google paths, so regressions there are caught elsewhere (manual or future targeted tests).
- mongodb-memory-server downloads a MongoDB binary, so first CI runs need caching to stay fast.

## Follow-up

- No test specific agent skill or MCP server was added; Jest, supertest, and mongodb-memory-server are standard libraries without a meaningful MCP offering. If a Jest focused skill becomes useful, it can be added to the root AGENTS.md context.
- The excluded external surfaces (Stripe, S3, Google) may deserve targeted tests later, but they are out of scope for this smoke suite.
