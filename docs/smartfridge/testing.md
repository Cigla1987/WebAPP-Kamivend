# Testing and migration

Generate migrations with `pnpm --dir apps/web db:generate`, review SQL, and apply only to staging with an explicit staging `DATABASE_URL`. Never use `db:push` or migration commands against production.
