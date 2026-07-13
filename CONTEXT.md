# Context: Vending Platform

## Glossary

### Application

- **Web App** — The primary TanStack Start full-stack web application. Owners manage machines, products, and organizations through a browser interface. Lives in `apps/web/`.
- **Electron App** — A future desktop application for field technicians. Authenticates against the Web App's API and maintains a local SQLite cache of vending data. Lives in `apps/desktop/` (not yet created).

### Packages

- **Auth Package** (`@vending/auth`) — Better Auth schema (PostgreSQL), access control roles, and `createAuthOptions(db)` factory. Exports schema and configuration but not a `betterAuth()` instance.
- **DB Package** (`@vending/db`) — Drizzle ORM schemas. Imports auth schema from `@vending/auth`, exports combined vending + auth schema index. Contains no database client or environment access.
- **UI Package** (`@vending/ui`) — shadcn/ui React components + Tailwind CSS theme. Consumed by both Web App and Electron App.
- **Domain Package** (`@vending/domain`) — Cross-cutting enums (`UserRole`, `MachineType`, etc.), `AppError`, and shared Zod DTOs.
- **TSConfig Package** (`@vending/tsconfig`) — Base TypeScript configuration shared by all packages and apps.

### External Systems

- **Better Auth** — The authentication and authorization framework. Web App owns the running instance; Electron App authenticates against it via bearer tokens.
- **Drizzle ORM** — The database ORM. Used by both `@vending/db` (schema definitions) and Web App (query client).
- **PostgreSQL** — The Web App's primary database.
- **SQLite** — The Electron App's local cache database (no auth tables, no foreign keys to auth).

### Concepts

- **Source Consumption** — Internal packages are imported as raw TypeScript source (no build step). Vite and TypeScript resolve through package.json exports.
- **Factory Pattern** — `@vending/auth` and `@vending/db` export factories, not instantiated objects. Apps own environment and instance creation.
- **Bearer Token** — Authentication mechanism for non-browser clients (Electron App). Complements cookie-based sessions in the Web App.
