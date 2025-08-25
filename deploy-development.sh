#!/bin/bash

# 개발 환경 배포 스크립트
echo "🚀 TA-GO 개발 환경 배포를 시작합니다..."

# 환경 변수 설정
export NODE_ENV=development
export BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

echo "📅 빌드 타임스탬프: $BUILD_DATE"
echo "🌍 환경: $NODE_ENV"

# 1. 기존 컨테이너 중지
echo "📦 기존 컨테이너를 중지합니다..."
docker-compose down

# 2. 개발용 이미지 빌드 (캐시 허용)
echo "🔨 개발용 이미지를 빌드합니다..."
docker-compose build --build-arg BUILD_DATE="$BUILD_DATE"

# 3. 컨테이너 시작
echo "🚀 컨테이너를 시작합니다..."
docker-compose up -d

# 4. 헬스체크 대기
echo "⏳ 서비스 시작을 기다립니다..."
sleep 10

# 5. 서비스 상태 확인
echo "🏥 서비스 상태를 확인합니다..."
docker-compose ps

# 6. 로그 확인
echo "📋 최근 로그:"
docker-compose logs --tail=5 ta-go-frontend

echo "✅ 개발 환경 배포가 완료되었습니다!"
echo "🌐 프론트엔드: http://localhost:3011"
echo "📊 로그 확인: docker-compose logs -f ta-go-frontend"
echo "🔄 핫 리로드: 코드 수정 후 docker-compose restart ta-go-frontend"
