#!/bin/bash

# ta-Go Docker Development Script
# Docker 환경에서 프론트엔드와 백엔드를 실행

echo "🐳 ta-Go Docker Development 시작..."
echo "📁 현재 디렉토리: $(pwd)"

# Docker가 실행 중인지 확인
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker가 실행되지 않았습니다. Docker Desktop을 시작해주세요."
    exit 1
fi

# 환경 변수 설정
export NEXT_PUBLIC_USE_LOCAL=true
export NEXT_PUBLIC_LOCAL_API_URL=http://localhost:3001
export NEXT_PUBLIC_LOCAL_WS_URL=ws://localhost:3001

echo "🔧 환경 변수 설정 완료:"
echo "   - NEXT_PUBLIC_USE_LOCAL: $NEXT_PUBLIC_USE_LOCAL"
echo "   - NEXT_PUBLIC_LOCAL_API_URL: $NEXT_PUBLIC_LOCAL_API_URL"
echo "   - NEXT_PUBLIC_LOCAL_WS_URL: $NEXT_PUBLIC_LOCAL_WS_URL"

# Docker Compose로 백엔드 실행
echo "🐳 Docker 백엔드 서버 시작 중... (포트: 3001)"
docker-compose up -d backend

# 잠시 대기
sleep 5

# 프론트엔드 서버 시작
echo "🎨 프론트엔드 서버 시작 중... (포트: 3011)"
npm run dev:local &
FRONTEND_PID=$!

echo "✅ 서버들이 시작되었습니다!"
echo "   - 백엔드 (Docker): http://localhost:3001"
echo "   - 프론트엔드: http://localhost:3011"
echo "   - GraphQL: http://localhost:3001/graphql"
echo ""
echo "🛑 서버를 중지하려면 Ctrl+C를 누르세요"

# 프로세스 종료 처리
trap 'echo "🛑 서버 종료 중..."; kill $FRONTEND_PID 2>/dev/null; docker-compose down; exit' INT

# 프로세스들이 실행 중인 동안 대기
wait
