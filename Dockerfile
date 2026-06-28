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
COPY --from=build /app/.output /app/.output
COPY --from=build /app/migrations /app/migrations
COPY --from=build /app/drizzle.config.ts /app/drizzle.config.ts
COPY package.json /app/package.json
COPY pnpm-workspace.yaml /app/pnpm-workspace.yaml
EXPOSE 3000
CMD [ "sh", "-c", "pnpm db:migrate && pnpm start" ]
