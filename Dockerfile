FROM node:18-alpine AS dependencies

RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

FROM node:18-alpine AS builder

RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY . .
RUN npm install

RUN npx prisma generate


ARG APP_NAME
RUN npx nx build ${APP_NAME} --prod

FROM node:18-alpine

WORKDIR /app
ARG APP_NAME

COPY --from=dependencies /app/node_modules ./node_modules

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

COPY --from=builder /app/apps/${APP_NAME}/dist .

EXPOSE 3000
CMD ["node", "main.js"]