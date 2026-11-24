# GraphQL schema and resolvers

## Overview

Defines the entire GraphQL API. Each domain (auth, user, product, order, review, wishlist, analytics, payment) has one type definitions file and one resolver file. The index files combine them and hand them to Apollo Server.

## Key files

| File | Owns |
|---|---|
| typeDefs/index.typeDef.ts | Combines all domain type definitions into one array |
| resolvers/index.resolver.ts | Combines all domain resolvers and defines the Date scalar |
| typeDefs/global.typeDef.ts | Shared scalars (Date, Upload) and the ReturnType type |
| typeDefs/*.typeDef.ts | One file per domain, exports a gql template string |
| resolvers/*.resolver.ts | One file per domain, exports a Query/Mutation object |

## Conventions

- A resolver file default-exports an object with `Query` and/or `Mutation` keys. Each field is an async function with signature `(parent, args, context)`.
- Context is `MyContext` from `types.ts`: `{ req, res, auth }`. Read the user from `context.auth`, never from headers directly.
- Type definition files default-export a `gql` tagged template string.
- To add a new domain, create a `<name>.typeDef.ts` and `<name>.resolver.ts`, then register both in the matching `index.*.ts` file.
- Errors use `GraphQLError` with `extensions: { code: ErrorCode.X }`. Form validation errors also carry an `extras` field with the field errors.
- Authorization checks repeat inline: `if (!auth)` throws `NOT_AUTHENTICATED`, then `auth.role !== UserRole.ADMIN` throws `WRONG_USER_TYPE`.
- `Date` and `Upload` are custom scalars. `Date` is defined in `resolvers/index.resolver.ts`; `Upload` comes from `graphql-upload-ts`.

## Gotchas

- `auth.resolver copy.ts` is a leftover duplicate and is not imported anywhere. Do not edit it or use it as a reference.
