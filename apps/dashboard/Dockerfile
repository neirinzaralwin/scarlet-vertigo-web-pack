FROM node:20-alpine AS base

FROM base AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy packages directory for shared dependencies
COPY packages ./packages

# Copy the specific app
COPY apps/dashboard ./apps/dashboard

# Install all dependencies (including devDependencies)
RUN npm install
# Build the application
RUN npm run build -- --filter=dashboard

FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy root package files for potential dependencies
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy the built application
COPY --from=builder /app/apps/dashboard/package.json ./apps/dashboard/package.json
COPY --from=builder /app/apps/dashboard/.next ./apps/dashboard/.next
COPY --from=builder /app/apps/dashboard/public* ./apps/dashboard/
COPY --from=builder /app/apps/dashboard/node_modules ./apps/dashboard/node_modules

# Copy shared packages if needed by the app
COPY --from=builder /app/packages ./packages

# Copy environment config if it exists
COPY apps/dashboard/.env* ./apps/dashboard/

EXPOSE 3001

CMD ["npm", "run", "start", "--prefix", "apps/dashboard"]