#!/bin/bash

# Docker 배포 스크립트
echo "🚀 TA-GO 프로젝트 배포를 시작합니다..."

# 기존 컨테이너 중지 및 제거
echo "📦 기존 컨테이너를 정리합니다..."
docker-compose down -v

# 이미지 빌드
echo "🔨 Docker 이미지를 빌드합니다..."
docker-compose build --no-cache

# 컨테이너 시작
echo "🚀 컨테이너를 시작합니다..."
docker-compose up -d

# 헬스체크
echo "🏥 서비스 상태를 확인합니다..."
sleep 10

# 컨테이너 상태 확인
docker-compose ps

echo "✅ 배포가 완료되었습니다!"
echo "🌐 프론트엔드: http://72.60.40.57:3011"
echo "🔌 API: http://72.60.40.57:3012"
echo "📊 로그 확인: docker-compose logs -f"
