#!/bin/bash

echo "🔧 Docker 복구를 시작합니다..."

# 1. Docker Desktop 상태 확인
echo "📋 Docker 상태를 확인합니다..."
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker Desktop이 실행되지 않았습니다."
    echo "🚀 Docker Desktop을 수동으로 시작해주세요."
    echo "   - Docker Desktop 앱을 열고 시작 버튼을 클릭하세요."
    echo "   - 또는 Applications 폴더에서 Docker Desktop을 찾아 실행하세요."
    echo ""
    echo "⏳ Docker Desktop이 시작될 때까지 기다린 후 Enter를 누르세요..."
    read -r
fi

# 2. Docker 서비스 상태 확인
echo "🔍 Docker 서비스 상태를 확인합니다..."
if docker info >/dev/null 2>&1; then
    echo "✅ Docker가 정상적으로 실행되고 있습니다."
else
    echo "❌ Docker 연결에 실패했습니다."
    exit 1
fi

# 3. 기존 컨테이너 정리
echo "🧹 기존 컨테이너를 정리합니다..."
docker-compose down -v 2>/dev/null || true
docker system prune -f

# 4. 서비스 재시작
echo "🚀 서비스를 재시작합니다..."
docker-compose up -d

# 5. 서비스 상태 확인
echo "🏥 서비스 상태를 확인합니다..."
sleep 10
docker-compose ps

# 6. 연결 테스트
echo "🧪 연결을 테스트합니다..."
echo "포트 80 (Nginx):"
curl -s --connect-timeout 5 http://72.60.40.57/graphql || echo "❌ 연결 실패"

echo "포트 3012 (직접 API):"
curl -s --connect-timeout 5 http://72.60.40.57:3012/graphql || echo "❌ 연결 실패"

echo ""
echo "✅ Docker 복구가 완료되었습니다!"
echo "🌐 프론트엔드: http://72.60.40.57:3011"
echo "🔌 API: http://72.60.40.57/graphql"
echo "📊 로그 확인: docker-compose logs -f"

