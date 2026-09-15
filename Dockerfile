# Stage 1: Build source code across monorepo packages
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root manifests and workspace configs
COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY apps/desktop/package.json ./apps/desktop/package.json
COPY api/ ./api/

# Install build dependencies
RUN npm install --ignore-scripts

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
