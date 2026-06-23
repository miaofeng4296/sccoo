# Stage 1: Build
FROM node:20.18.0-slim AS builder

RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile || pnpm install --no-frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client
RUN cd packages/db && npx prisma generate && cd ../..

# Build Next.js
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN cd apps/web && npx next build && cd ../..

# Stage 2: Production runtime
FROM node:20.18.0-slim AS runner

RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy only what's needed for production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./

# Ensure Prisma client is available
COPY --from=builder /app/node_modules/.pnpm/@prisma+client* /app/node_modules/.pnpm/ 2>/dev/null || true

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

# Start command
CMD ["sh", "-c", "cd apps/web && npx next start -p 3000"]
