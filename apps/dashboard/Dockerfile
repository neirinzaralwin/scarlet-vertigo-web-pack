FROM node:20-alpine AS base

FROM base AS builder

WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/dashboard ./apps/dashboard

RUN npm install
RUN npm run build -- --filter=dashboard

FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/dashboard/package.json ./apps/dashboard/package.json
COPY --from=builder /app/apps/dashboard/.next ./apps/dashboard/.next
COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public
COPY --from=builder /app/apps/dashboard/node_modules ./apps/dashboard/node_modules

COPY apps/dashboard/.env ./apps/dashboard/.env

EXPOSE 3001

CMD ["npm", "run", "start", "--prefix", "apps/dashboard"]