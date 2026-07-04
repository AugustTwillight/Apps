FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --prod
COPY server/ ./server/
COPY .env.example ./.env
EXPOSE 3001
CMD ["node", "server/index.cjs"]
