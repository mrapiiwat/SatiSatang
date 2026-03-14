FROM oven/bun:1.2-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --production
COPY . .

FROM oven/bun:1.2-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src ./src 
USER bun
EXPOSE 8080
CMD [ "bun", "run", "src/index.ts" ]