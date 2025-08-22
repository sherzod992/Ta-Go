#!/bin/bash

echo "⚡ 빠른 복구를 시작합니다..."

# 1. 환경 변수 업데이트
echo "🔧 환경 변수를 업데이트합니다..."
cat > .env.local << EOF
# Mock API 사용 (백엔드 연결 문제 해결)
NEXT_PUBLIC_API_URL=/api/mock-graphql
NEXT_PUBLIC_API_GRAPHQL_URL=/api/mock-graphql
NEXT_PUBLIC_API_WS=ws://localhost:3011

# 프로덕션 환경 API URLs (백업)
# NEXT_PUBLIC_API_URL=http://72.60.40.57/graphql
# NEXT_PUBLIC_API_GRAPHQL_URL=http://72.60.40.57/graphql
# NEXT_PUBLIC_API_WS=ws://72.60.40.57

# Authentication
NEXTAUTH_URL=http://localhost:3011
NEXTAUTH_SECRET=your-secret-key-here
EOF

# 2. 개발 서버 재시작
echo "🔄 개발 서버를 재시작합니다..."
pkill -f "next dev" || true
sleep 2

echo "🚀 개발 서버를 시작합니다..."
npm run dev &

echo "⏳ 서버 시작을 기다립니다..."
sleep 10

# 3. 연결 테스트
echo "🧪 Mock API 연결을 테스트합니다..."
curl -s -X POST http://localhost:3011/api/mock-graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' | head -c 100

echo ""
echo "✅ 빠른 복구가 완료되었습니다!"
echo "🌐 프론트엔드: http://localhost:3011"
echo "🔌 Mock API: http://localhost:3011/api/mock-graphql"
echo "📊 백엔드 상태: http://localhost:3011/backend-status"

