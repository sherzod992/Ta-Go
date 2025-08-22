#!/bin/bash

# 프론트엔드 배포 스크립트
echo "🚀 TA-GO 프론트엔드 배포를 시작합니다..."

# 기존 프론트엔드 컨테이너 중지 및 제거
echo "📦 기존 프론트엔드 컨테이너를 정리합니다..."
docker-compose stop ta-go-frontend
docker-compose rm -f ta-go-frontend

# 프론트엔드 이미지 빌드
echo "🔨 프론트엔드 Docker 이미지를 빌드합니다..."
docker-compose build --no-cache ta-go-frontend

# 프론트엔드 컨테이너 시작
echo "🚀 프론트엔드 컨테이너를 시작합니다..."
docker-compose up -d ta-go-frontend

# 헬스체크
echo "🏥 프론트엔드 상태를 확인합니다..."
sleep 5

# 컨테이너 상태 확인
docker-compose ps ta-go-frontend

echo "✅ 프론트엔드 배포가 완료되었습니다!"
echo "🌐 프론트엔드: http://72.60.40.57:3011"
echo "📊 로그 확인: docker-compose logs -f ta-go-frontend"
