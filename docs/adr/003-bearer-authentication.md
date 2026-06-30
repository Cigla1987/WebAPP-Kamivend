# ADR-003: Bearer Token Authentication for Non-Browser Clients

## Status

Accepted

## Context

The Web App uses TanStack Start with Better Auth, which defaults to cookie-based sessions via the `tanstackStartCookies()` plugin. Browser clients work seamlessly.

The Electron app is a non-browser client. It cannot rely on cookies for session transport because:
- It makes cross-origin (or cross-process) HTTP requests to the Web App backend
- Electron's `fetch` does not automatically send browser cookies from the web domain
- The app needs a token-based mechanism that works with standard `Authorization` headers

## Decision

We added Better Auth's `bearer()` plugin to the Web App's auth configuration.

The Web App's `betterAuth()` instance now has both transports:
- `tanstackStartCookies()` — for browser-based web users
- `bearer()` — for API clients (Electron, CLI tools, mobile apps)

The Electron app uses `better-auth/client` (vanilla, not React) with the `bearer` auth type:
```ts
const authClient = createAuthClient({
  baseURL: 'https://web-app.com',
  fetchOptions: {
    auth: {
      type: 'Bearer',
      token: () => secureStorage.get('auth_token')
    }
  }
});
```

## Consequences

### Positive
- A single Better Auth instance serves both browser and non-browser clients.
- No separate auth server or JWT library needed.
- `auth.api.getSession({ headers })` on the server automatically handles both cookies and bearer tokens.

### Negative
- The `bearer` plugin is marked as "use cautiously" in Better Auth docs. We must ensure tokens are stored securely in Electron (not `localStorage`).
- If a token is leaked, it is valid until expiry. We rely on Better Auth's built-in session expiry.
- CSRF protection is different for bearer tokens vs cookies.

## Related

- ADR-001: Electron App is Always-Online with Local Business Data Cache
- ADR-002: Internal Packages Use Factory Pattern
