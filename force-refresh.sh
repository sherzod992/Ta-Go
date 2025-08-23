#!/bin/bash

# 강제 새로고침 및 캐시 클리어 스크립트
echo "🔄 TA-GO 강제 새로고침을 시작합니다..."

# 1. 기존 컨테이너 완전 중지 및 제거
echo "📦 기존 컨테이너를 완전히 정리합니다..."
docker-compose down -v
docker system prune -f

# 2. 모든 이미지 제거 (강제 새로고침)
echo "🗑️ 기존 이미지를 모두 제거합니다..."
docker rmi $(docker images -q ta-go_ta-go-frontend) 2>/dev/null || true
docker rmi $(docker images -q ta-go-frontend) 2>/dev/null || true

# 3. 빌드 캐시 완전 클리어
echo "🧹 빌드 캐시를 완전히 클리어합니다..."
docker builder prune -f

# 4. 새로운 이미지 빌드 (캐시 없이)
echo "🔨 새로운 이미지를 빌드합니다..."
docker-compose build --no-cache --pull

# 5. 컨테이너 시작
echo "🚀 컨테이너를 시작합니다..."
docker-compose up -d

# 6. 헬스체크 대기
echo "🏥 서비스 상태를 확인합니다..."
sleep 15

# 7. 컨테이너 상태 확인
echo "📊 컨테이너 상태:"
docker-compose ps

# 8. 로그 확인
echo "📋 최근 로그 확인:"
docker-compose logs --tail=20 ta-go-frontend

echo "✅ 강제 새로고침이 완료되었습니다!"
echo "🌐 프론트엔드: http://72.60.40.57:3011"
echo "🔌 API: http://72.60.40.57:3012"
echo ""
echo "💡 브라우저에서도 강제 새로고침(Ctrl+F5 또는 Cmd+Shift+R)을 해주세요!"

