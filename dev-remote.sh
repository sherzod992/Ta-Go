#!/bin/bash

# ta-Go Remote Development Script
# 원격 서버 환경에서 프론트엔드만 실행

echo "🚀 ta-Go Remote Development 시작..."
echo "📁 현재 디렉토리: $(pwd)"

# 프론트엔드 의존성 설치 확인
if [ ! -d "node_modules" ]; then
    echo "📦 프론트엔드 의존성 설치 중..."
    npm install
fi

# 환경 변수 설정
export NEXT_PUBLIC_USE_LOCAL=false
export NEXT_PUBLIC_REMOTE_API_URL=http://72.60.40.57:3001
export NEXT_PUBLIC_REMOTE_WS_URL=ws://72.60.40.57:3001

echo "🔧 환경 변수 설정 완료:"
echo "   - NEXT_PUBLIC_USE_LOCAL: $NEXT_PUBLIC_USE_LOCAL"
echo "   - NEXT_PUBLIC_REMOTE_API_URL: $NEXT_PUBLIC_REMOTE_API_URL"
echo "   - NEXT_PUBLIC_REMOTE_WS_URL: $NEXT_PUBLIC_REMOTE_WS_URL"

# 프론트엔드 서버 시작
echo "🎨 프론트엔드 서버 시작 중... (포트: 3011)"
echo "🔗 원격 백엔드 서버: http://72.60.40.57:3001"
npm run dev:remote

echo "✅ 프론트엔드 서버가 시작되었습니다!"
echo "   - 프론트엔드: http://localhost:3011"
echo "   - 원격 백엔드: http://72.60.40.57:3001"
echo "   - GraphQL: http://72.60.40.57:3001/graphql"
