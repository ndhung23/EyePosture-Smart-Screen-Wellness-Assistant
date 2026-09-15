# Stage 1: Build source code across monorepo packages
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root manifests and workspace configs
COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/billing/package.json ./packages/billing/
COPY packages/database/package.json ./packages/database/
COPY packages/reminder-engine/package.json ./packages/reminder-engine/
COPY packages/vision/package.json ./packages/vision/
COPY packages/i18n/package.json ./packages/i18n/
COPY apps/api/package.json ./apps/api/

# Install build dependencies
RUN npm install

# Copy source codes
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Compile packages in dependency order
RUN npm run build:api

# Stage 2: Production runtime image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy manifests and dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api

EXPOSE 8080

CMD ["node", "apps/api/dist/start.js"]
