#!/bin/bash

# ta-Go Local Development Script
# localhost 환경에서 프론트엔드와 백엔드를 동시에 실행

echo "🚀 ta-Go Local Development 시작..."
echo "📁 현재 디렉토리: $(pwd)"

# 백엔드 의존성 설치 확인
if [ ! -d "server/node_modules" ]; then
    echo "📦 백엔드 의존성 설치 중..."
    cd server
    npm install
    cd ..
fi

# 프론트엔드 의존성 설치 확인
if [ ! -d "node_modules" ]; then
    echo "📦 프론트엔드 의존성 설치 중..."
    npm install
fi

# 환경 변수 설정
export NEXT_PUBLIC_USE_LOCAL=true
export NEXT_PUBLIC_LOCAL_API_URL=http://localhost:3000
export NEXT_PUBLIC_LOCAL_WS_URL=ws://localhost:3000

echo "🔧 환경 변수 설정 완료:"
echo "   - NEXT_PUBLIC_USE_LOCAL: $NEXT_PUBLIC_USE_LOCAL"
echo "   - NEXT_PUBLIC_LOCAL_API_URL: $NEXT_PUBLIC_LOCAL_API_URL"
echo "   - NEXT_PUBLIC_LOCAL_WS_URL: $NEXT_PUBLIC_LOCAL_WS_URL"

# 백엔드 서버 시작 (백그라운드)
echo "🔧 백엔드 서버 시작 중... (포트: 3000)"
cd server
npm run dev:local &
BACKEND_PID=$!
cd ..

# 잠시 대기
sleep 3

# 프론트엔드 서버 시작
echo "🎨 프론트엔드 서버 시작 중... (포트: 3011)"
npm run dev:local &
FRONTEND_PID=$!

echo "✅ 서버들이 시작되었습니다!"
echo "   - 백엔드: http://localhost:3000"
echo "   - 프론트엔드: http://localhost:3011"
echo "   - GraphQL: http://localhost:3000/graphql"
echo ""
echo "🛑 서버를 중지하려면 Ctrl+C를 누르세요"

# 프로세스 종료 처리
trap 'echo "🛑 서버 종료 중..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT

# 프로세스들이 실행 중인 동안 대기
wait
