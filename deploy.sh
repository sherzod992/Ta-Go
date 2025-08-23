#!/bin/bash

# Docker 배포 스크립트
echo "🚀 TA-GO 프로젝트 배포를 시작합니다..."

# 현재 시간을 빌드 타임스탬프로 사용
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
echo "📅 빌드 타임스탬프: $BUILD_DATE"

# 기존 컨테이너 중지 및 제거
echo "📦 기존 컨테이너를 정리합니다..."
docker-compose down -v

# 기존 이미지 제거 (캐시 무효화)
echo "🗑️ 기존 이미지를 제거합니다..."
docker rmi ta-go-ta-go-frontend:latest 2>/dev/null || true

# Docker 빌드 캐시 정리
echo "🧹 Docker 빌드 캐시를 정리합니다..."
docker builder prune -f

# 이미지 빌드 (캐시 없이)
echo "🔨 Docker 이미지를 빌드합니다..."
docker-compose build --no-cache --build-arg BUILD_DATE="$BUILD_DATE"

# 컨테이너 시작
echo "🚀 컨테이너를 시작합니다..."
docker-compose up -d

# 헬스체크
echo "🏥 서비스 상태를 확인합니다..."
sleep 10

# 컨테이너 상태 확인
docker-compose ps

# 빌드 정보 확인
echo "📋 빌드 정보:"
docker inspect ta-go-ta-go-frontend:latest | grep -A 2 -B 2 "build-date"

echo "✅ 배포가 완료되었습니다!"
echo "🌐 프론트엔드: http://72.60.40.57:3011"
echo "🔌 API: http://72.60.40.57:3012"
echo "📊 로그 확인: docker-compose logs -f"
