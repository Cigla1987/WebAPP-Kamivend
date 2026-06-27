# syntax=docker/dockerfile:1

# Base image
FROM node:24-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
CMD ["npx", "srvx", "--prod", "-s", "dist/client", "dist/server/server.js"]
