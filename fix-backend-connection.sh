#!/bin/bash

echo "🔧 백엔드 연결 문제 해결을 시작합니다..."

# 1. 서버 연결 상태 확인
echo "📡 서버 연결 상태를 확인합니다..."
echo "포트 3000 (Nginx):"
curl -s --connect-timeout 5 http://72.60.40.57:3000/graphql || echo "❌ 연결 실패"

echo "포트 3012 (직접 API):"
curl -s --connect-timeout 5 http://72.60.40.57:3012/graphql || echo "❌ 연결 실패"

# 2. 로컬 개발 환경 설정
echo "🛠️ 로컬 개발 환경을 설정합니다..."

# 환경 변수 파일 업데이트
if [ ! -f ".env.local" ]; then
    echo "📝 .env.local 파일을 생성합니다..."
    cat > .env.local << EOF
# 개발 환경 API URLs
NEXT_PUBLIC_API_URL=http://localhost:3012/graphql
NEXT_PUBLIC_API_GRAPHQL_URL=http://localhost:3012/graphql
NEXT_PUBLIC_API_WS=ws://localhost:3012

# 프로덕션 환경 API URLs (백업)
# NEXT_PUBLIC_API_URL=http://72.60.40.57:3000/graphql
# NEXT_PUBLIC_API_GRAPHQL_URL=http://72.60.40.57:3000/graphql
# NEXT_PUBLIC_API_WS=ws://72.60.40.57:3000

# Authentication
NEXTAUTH_URL=http://localhost:3011
NEXTAUTH_SECRET=your-secret-key-here
EOF
    echo "✅ .env.local 파일이 생성되었습니다."
else
    echo "📝 .env.local 파일이 이미 존재합니다."
fi

# 3. 개발 서버 재시작
echo "🔄 개발 서버를 재시작합니다..."
pkill -f "next dev" || true
sleep 2

echo "🚀 개발 서버를 시작합니다..."
npm run dev &

echo "⏳ 서버 시작을 기다립니다..."
sleep 10

# 4. 연결 테스트
echo "🧪 연결을 테스트합니다..."
curl -s http://localhost:3011/api/test-backend | jq . || echo "❌ 테스트 API 호출 실패"

echo "✅ 백엔드 연결 문제 해결이 완료되었습니다!"
echo "🌐 프론트엔드: http://localhost:3011"
echo "🔌 백엔드 상태 확인: http://localhost:3011/backend-status"

