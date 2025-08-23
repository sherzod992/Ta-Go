# 프론트엔드 Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./
COPY yarn.lock ./

# 의존성 설치
RUN yarn install --frozen-lockfile

# 소스 코드 복사 (캐시 무효화를 위해 타임스탬프 추가)
COPY . .

# 빌드 타임스탬프를 환경변수로 설정하여 캐시 무효화
ARG BUILD_DATE
ENV BUILD_DATE=${BUILD_DATE}

# 환경 변수 설정
ENV NEXT_PUBLIC_API_URL=http://72.60.40.57:3000/graphql
ENV NEXT_PUBLIC_API_WS=ws://72.60.40.57:3000/graphql
ENV NODE_ENV=production

# 빌드 (캐시 무효화를 위해 타임스탬프 사용)
RUN echo "Build time: $BUILD_DATE" && yarn build

# 프로덕션 이미지
FROM node:20-alpine AS runner

WORKDIR /app

# 필요한 파일들만 복사
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# 프로덕션 의존성만 설치
RUN yarn install --production --frozen-lockfile

# 환경 변수 설정
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://72.60.40.57:3000/graphql
ENV NEXT_PUBLIC_API_WS=ws://72.60.40.57:3000/graphql

# 빌드 정보 레이블 추가
ARG BUILD_DATE
LABEL build-date="${BUILD_DATE}"

EXPOSE 3011

# Next.js 서버 시작
CMD ["yarn", "start"]
