# Roadmap

Build approach: Tracer Bullet. Each refactor slice lands end to end, verified green against the smoke suite before the next slice begins.

## At a glance

| # | Feature | Phase | Weight | Needs ADR | Status |
|---|---|---|---|---|---|
| 1 | Tooling and CI baseline | Foundation | medium | no | in-progress |
| 2 | Test harness and smoke suite | Foundation | full | yes | in-progress |
| 3 | Type system overhaul | Slice 1 | medium | no | planned |
| 4 | Dead code removal | Slice 1 | lean | no | planned |
| 5 | Resolver argument typing | Slice 2 | medium | no | planned |
| 6 | Shared auth and error helpers | Slice 2 | lean | no | planned |
| 7 | Service and repository layer | Slice 3 | full | yes | planned |
| 8 | Build, deploy, and env validation | Slice 3 | medium | yes | planned |
| 9 | Security hardening | Slice 4 | full | yes | planned |

## Foundation

### 1. Tooling and CI baseline · medium · in progress

Intent: give the project guardrails so every later change is checked.

Done when: ESLint and Prettier run, a typecheck script passes clean, a real build script exists, and pre commit hooks plus CI run them all.

- [x] /develop tooling

Code in eslint.config.mjs, .prettierrc.json, .husky/pre-commit, .github/workflows/ci.yml, and the scripts in package.json.

### 2. Test harness and smoke suite · full

Intent: build the safety net that makes the deep restructure safe.

Done when: a test runner boots the server and hits the core GraphQL queries and mutations, all green and runnable in CI.

- [x] Design it (ADR): [0001](../adr/0001-test-harness.md)
- [x] Build it: /develop test harness
  - [x] Refactor server entry into an app and server builder (AC-4)
  - [x] Harness bootstrap: deps, Jest config, in memory DB, test client and seeds, first auth smoke test (AC-1, AC-5)
  - [x] Auth suite: register, login, status, logout, refresh, admin (AC-2)
  - [x] User, product read, review, and wishlist suites (AC-2)
  - [x] Order and analytics suites plus the CI test job (AC-2, AC-3, AC-6)

Code in api/app.ts, jest.config.json, tests/, and the test job in .github/workflows/ci.yml.
- [x] Verify it: /verify test harness
- [ ] Test it: /test test harness

## Slice 1

### 3. Type system overhaul · medium

Intent: make the shared types honest before touching resolvers.

Done when: types.ts uses primitives and consistent names, typos are fixed, arrays are arrays, and the whole codebase still compiles.

- [ ] /develop types

### 4. Dead code removal · lean

Intent: delete what is not used.

Done when: the three copy files, the unused apollo-server-express dependency, unused imports, and commented out code are gone.

- [ ] /develop cleanup

## Slice 2

### 5. Resolver argument typing · medium

Intent: remove the 62 any usages so errors surface at compile time.

Done when: every resolver has typed parent and args and no any remains.

- [ ] /develop resolver typing

### 6. Shared auth and error helpers · lean

Intent: stop repeating auth checks and error wrapping.

Done when: requireAuth and requireAdmin helpers replace the inline checks, and GraphQLError is thrown consistently.

- [ ] /develop auth helpers

## Slice 3

### 7. Service and repository layer · full · needs a decision

Intent: move data access out of resolvers into a dedicated layer.

Done when: resolvers call services, services call models, and the smoke suite stays green.

- [ ] /blueprint service layer

### 8. Build, deploy, and env validation · medium · needs a decision

Intent: make the build and deploy setup consistent and fail fast on missing config.

Done when: the start, build, and main scripts agree, vercel.json is correct, and env vars are validated at startup.

- [ ] /blueprint build deploy

## Slice 4

### 9. Security hardening · full · needs a decision

Intent: fix the plaintext admin login, cookie flags, and rate limiting gaps.

Done when: admin auth no longer uses a plaintext env comparison, cookies are set correctly per environment, and abuse paths are rate limited.

- [ ] /blueprint security hardening

## Legend

- Phase: Foundation, then Slice 1 through Slice 4. Foundation comes first; each slice builds on the one before it.
- Weight: lean, medium, or full. Full features require design review and hardening.
- Needs ADR: yes means the next step is /blueprint; no means /develop directly.
- Status: planned, in progress, done, existing, or dropped.
