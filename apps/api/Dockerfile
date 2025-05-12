FROM node:20-alpine AS base

FROM base AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy packages directory for shared dependencies
COPY packages ./packages

# Copy the specific app
COPY apps/api ./apps/api

# Install all dependencies (including devDependencies)
RUN npm install
# Build the application
RUN npm run build -- --filter=api

FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy root package files for potential dependencies
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy the built application
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Copy shared packages if needed by the app
COPY --from=builder /app/packages ./packages

# Copy environment config
COPY apps/api/.env ./apps/api/.env

EXPOSE 3031

CMD ["npm", "run", "start:prod", "--prefix", "apps/api"]