#!/bin/bash

# 프로덕션 배포 스크립트
echo "🚀 TA-GO 프로덕션 배포를 시작합니다..."

# 환경 변수 설정
export NODE_ENV=production
export BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

echo "📅 빌드 타임스탬프: $BUILD_DATE"
echo "🌍 환경: $NODE_ENV"

# 1. 기존 컨테이너 완전 정리
echo "📦 기존 컨테이너를 정리합니다..."
docker-compose down -v

# 2. 이미지 및 캐시 완전 제거
echo "🗑️ 기존 이미지를 제거합니다..."
docker rmi ta-go-ta-go-frontend:latest 2>/dev/null || true
docker system prune -f

# 3. 빌드 캐시 정리
echo "🧹 Docker 빌드 캐시를 정리합니다..."
docker builder prune -f

# 4. 새 이미지 빌드 (캐시 없이)
echo "🔨 Docker 이미지를 빌드합니다..."
docker-compose build --no-cache --build-arg BUILD_DATE="$BUILD_DATE"

# 5. 컨테이너 시작
echo "🚀 컨테이너를 시작합니다..."
docker-compose up -d

# 6. 헬스체크 대기
echo "⏳ 서비스 시작을 기다립니다..."
sleep 15

# 7. 서비스 상태 확인
echo "🏥 서비스 상태를 확인합니다..."
docker-compose ps

# 8. 로그 확인
echo "📋 최근 로그:"
docker-compose logs --tail=10 ta-go-frontend

# 9. 빌드 정보 확인
echo "📋 빌드 정보:"
docker inspect ta-go-ta-go-frontend:latest | grep -A 2 -B 2 "build-date"

# 10. 접속 테스트
echo "🌐 접속 테스트:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3011

echo "✅ 프로덕션 배포가 완료되었습니다!"
echo "🌐 프론트엔드: http://72.60.40.57:3011"
echo "📊 로그 확인: docker-compose logs -f ta-go-frontend"
