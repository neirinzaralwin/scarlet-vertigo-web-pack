FROM node:20-alpine AS base

FROM base AS builder

WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN npm install
RUN npm run build -- --filter=api

FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
RUN cd apps/api && npm install --production

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY apps/api/.env ./apps/api/.env

EXPOSE 3031

CMD ["node", "apps/api/dist/main"]