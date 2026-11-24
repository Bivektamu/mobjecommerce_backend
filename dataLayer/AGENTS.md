# Data layer

## Overview

Holds the MongoDB connection and the Mongoose schemas (models). Each entity has one schema file, and resolvers import the models directly. There is no repository or service layer.

## Key files

| File | Owns |
|---|---|
| index.ts | Connects to MongoDB via Mongoose, default-exported as `connectDB` |
| schema/User.ts | User model and the shared AddressSchema |
| schema/Product.ts | Product model |
| schema/Order.ts | Order model plus OrderItem, Refund, and Customer sub-schemas |
| schema/Review.ts | Review model |
| schema/WishList.ts | WishList model |
| schema/Counter.ts | Counter model (used for order numbers) |

## Conventions

- Each schema file default-exports a `mongoose.model('Name', Schema)`.
- Field definitions use standard Mongoose `Schema` syntax: `required: true` on non optional fields, enums via `Object.values(EnumName)` from `types.ts` or a plain string array.
- Embedded sub-schemas (not referenced) are defined with `{ _id: false }`, e.g. OrderItem and Address.
- The shared `AddressSchema` is defined in `User.ts` and reused by the Order schema.

## Gotchas

- `connectDB()` logs the error and calls `process.exit(1)` on failure; it does not retry.
- The Order schema defaults the currency to AUD.
