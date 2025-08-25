#!/bin/bash

# 캐시 클리어 스크립트
echo "🧹 TA-GO 캐시 클리어를 시작합니다..."

# 1. Docker 컨테이너 중지
echo "📦 Docker 컨테이너를 중지합니다..."
docker-compose down

# 2. Docker 이미지 제거
echo "🗑️ Docker 이미지를 제거합니다..."
docker rmi ta-go-ta-go-frontend:latest 2>/dev/null || true

# 3. Docker 시스템 정리
echo "🧹 Docker 시스템을 정리합니다..."
docker system prune -f
docker builder prune -f

# 4. Nginx 캐시 클리어 (컨테이너 재시작)
echo "🌐 Nginx 캐시를 클리어합니다..."
docker-compose restart nginx

# 5. 브라우저 캐시 클리어 안내
echo "🌍 브라우저 캐시 클리어 안내:"
echo "   - Windows: Ctrl + Shift + R"
echo "   - Mac: Cmd + Shift + R"
echo "   - 또는 시크릿/프라이빗 모드에서 접속"

# 6. 컨테이너 재시작
echo "🚀 컨테이너를 재시작합니다..."
docker-compose up -d

echo "✅ 캐시 클리어가 완료되었습니다!"
echo "🌐 접속: http://localhost:3011"
