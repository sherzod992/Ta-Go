#!/bin/bash

# 빠른 배포 스크립트
echo "🚀 TA-GO 빠른 배포를 시작합니다..."

# 1. 현재 상태 확인
echo "📊 현재 컨테이너 상태:"
docker-compose ps

# 2. 기존 컨테이너 중지
echo "🛑 기존 컨테이너를 중지합니다..."
docker-compose down

# 3. 최신 이미지 빌드 (캐시 사용)
echo "🔨 최신 이미지를 빌드합니다..."
docker-compose build

# 4. 컨테이너 시작
echo "🚀 컨테이너를 시작합니다..."
docker-compose up -d

# 5. 헬스체크
echo "🏥 서비스 상태를 확인합니다..."
sleep 10

# 6. 최종 상태 확인
echo "📊 배포 후 컨테이너 상태:"
docker-compose ps

# 7. 로그 확인
echo "📋 최근 로그:"
docker-compose logs --tail=10 ta-go-frontend

echo "✅ 빠른 배포가 완료되었습니다!"
echo "🌐 프론트엔드: http://72.60.40.57:3011"
echo "🔌 API: http://72.60.40.57:3012"
echo ""
echo "💡 브라우저에서 강제 새로고침(Ctrl+F5)을 해주세요!"
