FROM node:20-alpine AS base

FROM base AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy packages directory for shared dependencies
COPY packages ./packages

# Copy the specific app
COPY apps/scarlet-frontend ./apps/scarlet-frontend

# Install all dependencies (including devDependencies)
RUN npm install
# Build the application
RUN npm run build -- --filter=scarlet-frontend

FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy root package files for potential dependencies
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy the built application
COPY --from=builder /app/apps/scarlet-frontend/package.json ./apps/scarlet-frontend/package.json
COPY --from=builder /app/apps/scarlet-frontend/.next ./apps/scarlet-frontend/.next
COPY --from=builder /app/apps/scarlet-frontend/public* ./apps/scarlet-frontend/
COPY --from=builder /app/apps/scarlet-frontend/node_modules ./apps/scarlet-frontend/node_modules

# Copy shared packages if needed by the app
COPY --from=builder /app/packages ./packages

# Copy environment config if it exists
COPY apps/scarlet-frontend/.env* ./apps/scarlet-frontend/

EXPOSE 3002

CMD ["npm", "run", "start", "--prefix", "apps/scarlet-frontend"]