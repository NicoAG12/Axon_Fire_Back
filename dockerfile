FROM node:22-alpine AS builder
RUN apk add --no-cache python3 make g++ postgresql-dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy?schema=public


RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD npx prisma migrate deploy && node dist/index.js