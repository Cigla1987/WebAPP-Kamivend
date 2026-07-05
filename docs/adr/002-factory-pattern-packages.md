# ADR-002: Internal Packages Use Factory Pattern, No Env/Instance Ownership

## Status

Accepted

## Context

When splitting the monolithic application into internal packages (`@vending/auth`, `@vending/db`), we needed to decide:
- Should `@vending/auth` export a running `betterAuth()` instance?
- Should `@vending/db` export a running Drizzle client connected to PostgreSQL?
- Where do environment variables live?

The auth package and db package had a natural circular dependency:
- Auth needs a database connection to initialize `betterAuth()`
- DB needs the auth schema to define tables and run migrations

## Decision

Both `@vending/auth` and `@vending/db` are **pure factories** that own their domain but do not own instances or environment.

- `@vending/auth` exports:
  - The generated Drizzle schema (`pgTable` definitions)
  - Access control roles (`owner`, `employee`, `ac`)
  - `createAuthOptions(db, config)` factory returning `BetterAuthOptions`
  - Zod schemas/types derived from auth tables

- `@vending/db` exports:
  - Vending domain schema (`pgTable` definitions)
  - Combined schema index (vending + re-exported auth)

- The **Web App** owns:
  - Environment variable parsing (`serverEnv()`)
  - The PostgreSQL pool and Drizzle client (`db = drizzle(pool, schema)`)
  - The `betterAuth()` instance (calls factory, adds app-specific plugins)

## Consequences

### Positive
- Clean separation of concerns. Packages are reusable and testable.
- No circular dependencies between packages.
- The Electron app does not need to import `@vending/auth` or `@vending/db` at all (it uses the Web API).
- Future apps can create their own auth/db instances with different adapters or configs.

### Negative
- Slightly more boilerplate in the Web App (must call factories and pass env).
- `better-auth/client` type inference depends on the final `auth` instance, which lives in the Web App. The auth-client (`auth-client.ts`) stays in the Web App.

## Related

- ADR-003: Bearer Token Authentication for Non-Browser Clients
