# ADR-001: Electron App is Always-Online with Local Business Data Cache

## Status

Accepted

## Context

The platform has two target applications:
- A web dashboard for owners and administrators
- A desktop application for field technicians managing vending machines on-site

The critical requirement is that the **same user accounts** must work across both applications. An owner logged into the web app must be able to use the same credentials on the Electron app.

Two architectures were considered:
1. **Local-first auth** — Electron runs its own Better Auth instance against a local SQLite database, with bidirectional sync of auth tables to the web backend.
2. **Always-online auth** — Electron authenticates against the web backend API, stores the bearer token locally, and maintains a local SQLite cache of business data (machines, products, compartments).

## Decision

We chose **always-online auth** (Option 2).

The Electron app:
- Authenticates via HTTP against the Web App's Better Auth API
- Stores the bearer token in Electron's secure storage
- Makes all authenticated API calls to the Web App backend
- Maintains a local SQLite cache for business data (vending schema only, no auth tables)
- The cache has no foreign key constraints to auth tables

## Consequences

### Positive
- Dramatically simpler architecture. No sync engine for auth data.
- Single source of truth for auth (the Web App's PostgreSQL database).
- Better Auth's `bearer()` plugin provides built-in bearer token support.
- The Electron app can be built incrementally without solving distributed auth.

### Negative
- Electron requires internet connectivity for login and auth-protected operations.
- Offline read/write of business data requires a separate sync layer (not part of this ADR).
- Session tokens must be securely stored and refreshed in Electron.

## Related

- ADR-003: Bearer Token Authentication for Non-Browser Clients
