# syntax=docker/dockerfile:1

# Base image
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

# Production dependencies
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build stage
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# Production stage
FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/apps/web/node_modules /app/apps/web/node_modules
COPY --from=prod-deps /app/packages/auth/node_modules /app/packages/auth/node_modules
COPY --from=prod-deps /app/packages/db/node_modules /app/packages/db/node_modules
COPY --from=build /app/apps/web/.output /app/apps/web/.output
COPY --from=build /app/apps/web/migrations /app/apps/web/migrations
COPY --from=build /app/apps/web/drizzle.config.ts /app/apps/web/drizzle.config.ts
COPY package.json /app/package.json
COPY pnpm-workspace.yaml /app/pnpm-workspace.yaml
EXPOSE 3000
CMD [ "sh", "-c", "cd apps/web && pnpm db:migrate && pnpm start" ]
