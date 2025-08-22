#!/bin/bash

echo "🔄 강제 새로고침을 시작합니다..."

# 1. 개발 서버 완전 재시작
echo "🛑 개발 서버를 완전히 중지합니다..."
pkill -f "next dev" || true
pkill -f "next" || true
sleep 3

# 2. Next.js 캐시 삭제
echo "🧹 Next.js 캐시를 삭제합니다..."
rm -rf .next
rm -rf node_modules/.cache

# 3. 환경 변수 재설정
echo "🔧 환경 변수를 재설정합니다..."
cat > .env.local << EOF
# Mock API 사용 (백엔드 연결 문제 해결)
NEXT_PUBLIC_API_URL=/api/mock-graphql
NEXT_PUBLIC_API_GRAPHQL_URL=/api/mock-graphql
NEXT_PUBLIC_API_WS=ws://localhost:3011

# Authentication
NEXTAUTH_URL=http://localhost:3011
NEXTAUTH_SECRET=your-secret-key-here
EOF

# 4. 개발 서버 재시작
echo "🚀 개발 서버를 재시작합니다..."
npm run dev &

echo "⏳ 서버 시작을 기다립니다..."
sleep 15

# 5. Mock API 테스트
echo "🧪 Mock API를 테스트합니다..."
curl -s -X POST http://localhost:3011/api/mock-graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' | head -c 200

echo ""
echo "✅ 강제 새로고침이 완료되었습니다!"
echo ""
echo "📋 다음 단계:"
echo "1. 브라우저에서 http://localhost:3011 접속"
echo "2. Ctrl+Shift+R (강제 새로고침)"
echo "3. 개발자 도구(F12)에서 Console 탭 확인"
echo "4. '🔧 Apollo Client - API URL:' 로그 확인"
echo ""
echo "🌐 프론트엔드: http://localhost:3011"
echo "🔌 Mock API: http://localhost:3011/api/mock-graphql"

