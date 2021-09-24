#
# Builder stage.
#
FROM node:16 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY app.ts ./
COPY ./bin ./bin
COPY ./config ./config
COPY ./controllers ./controllers
COPY ./models ./models
COPY ./routes ./routes
COPY ./services ./services
COPY ./public ./public

RUN npm ci --quiet --only=production
RUN npm run build

#
# Production stage.
#
FROM node:16-alpine
EXPOSE 3000

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY ./public ./public


## We just need the build to execute the command
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

ENTRYPOINT node dist/bin/start.js