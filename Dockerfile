# ─────────────────────────────────────────────────────────
# HRIS Core API — Multi-stage Dockerfile
# Target: Render (or any container platform)
# ─────────────────────────────────────────────────────────

# ─── Stage 1: Build ────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install ALL dependencies (devDependencies needed for nest build & prisma generate)
RUN npm ci

# Copy Prisma schema & config (needed for prisma generate)
COPY prisma/ ./prisma/
COPY prisma.config.ts ./

# Generate Prisma client
RUN npx prisma generate

# Copy remaining source
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ ./src/
COPY config/ ./config/

# Build NestJS app
RUN npm run build

# ─── Stage 2: Production ───────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install ONLY production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy build artifacts from build stage
# (generated Prisma client is compiled into dist/ — no need to copy .prisma separately)
COPY --from=build /app/dist/ ./dist/

# Copy Prisma resources needed for runtime migrations
COPY --from=build /app/prisma/ ./prisma/
COPY --from=build /app/prisma.config.ts ./

# Copy config files (loaded by ConfigModule at runtime)
COPY --from=build /app/config/ ./config/

# Switch to non-root user
USER appuser

# Render sets PORT automatically; fallback to 3000
EXPOSE 3000

# Health check — pings the API every 30s (uses Node.js, no extra deps)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||3000)+'/api',r=>{process.exit(r.statusCode===200?0:1)})"

# Entrypoint: run migrations, then start the server
# --no-experimental-require-module is scoped to the node process only (not ENV)
# because npx/prisma internally needs the default behavior to load ESM deps.
CMD ["sh", "-c", "npx prisma migrate deploy && node --no-experimental-require-module dist/src/main"]
