FROM node:22-alpine AS builder

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma:generate && pnpm --filter @budgetflow/api build
RUN pnpm --filter @budgetflow/api deploy --prod /prod/api

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S budgetflow && adduser -S budgetflow -G budgetflow

COPY --from=builder /prod/api ./

USER budgetflow

EXPOSE 3000

CMD ["node", "dist/main.js"]
