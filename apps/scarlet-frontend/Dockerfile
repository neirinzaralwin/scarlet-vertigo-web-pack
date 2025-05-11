FROM node:20-alpine AS base

FROM base AS builder

WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/scarlet-frontend ./apps/scarlet-frontend

RUN npm install
RUN npm run build -- --filter=scarlet-frontend

FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/scarlet-frontend/package.json ./apps/scarlet-frontend/package.json
COPY --from=builder /app/apps/scarlet-frontend/.next ./apps/scarlet-frontend/.next
COPY --from=builder /app/apps/scarlet-frontend/public ./apps/scarlet-frontend/public
COPY --from=builder /app/apps/scarlet-frontend/node_modules ./apps/scarlet-frontend/node_modules

COPY apps/scarlet-frontend/.env ./apps/scarlet-frontend/.env

EXPOSE 3002

CMD ["npm", "run", "start", "--prefix", "apps/scarlet-frontend"]