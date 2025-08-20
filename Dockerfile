# 프론트엔드 Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./
COPY yarn.lock ./

# 의존성 설치
RUN yarn install --frozen-lockfile

# 소스 코드 복사
COPY . .

# 빌드
RUN yarn build

# 프로덕션 이미지
FROM nginx:alpine

# 빌드된 파일 복사
COPY --from=builder /app/out /usr/share/nginx/html

# Nginx 설정 복사
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
