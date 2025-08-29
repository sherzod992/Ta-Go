# 프론트엔드 Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

# 의존성 설치
COPY package.json yarn.lock ./
RUN yarn install

# 소스 코드 복사
COPY . .

# Next.js 빌드
RUN yarn build

# 프로덕션 단계
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3011
ENV HOSTNAME="0.0.0.0"

# curl 설치 (헬스체크용)
RUN apk add --no-cache curl

# 빌드 결과 복사
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# standalone 서버 파일 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 프로덕션 의존성만 설치
RUN yarn install --production

EXPOSE 3011

# standalone 모드에 맞는 시작 명령어
CMD ["node", "server.js"]
