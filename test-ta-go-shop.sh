#!/bin/bash

# ta-go.shop 도메인 테스트 스크립트
echo "🔍 ta-go.shop 도메인 테스트를 시작합니다..."

# 1. 서비스 상태 확인
echo "📊 서비스 상태 확인..."
docker-compose ps

# 2. ta-go.shop HTTP 접근 테스트
echo "🌐 ta-go.shop HTTP 접근 테스트..."
curl -s -o /dev/null -w "ta-go.shop HTTP 응답 코드: %{http_code}\n" http://ta-go.shop

# 3. ta-go.shop HTTPS 접근 테스트
echo "🔒 ta-go.shop HTTPS 접근 테스트..."
curl -s -o /dev/null -w "ta-go.shop HTTPS 응답 코드: %{http_code}\n" https://ta-go.shop

# 4. GraphQL API 테스트 (ta-go.shop을 통한 프록시)
echo "🔧 GraphQL API 테스트 (ta-go.shop 프록시)..."
GRAPHQL_RESPONSE=$(curl -s -X POST https://ta-go.shop/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __schema { types { name } } }"}')

if echo "$GRAPHQL_RESPONSE" | grep -q "Member"; then
    echo "✅ GraphQL API 정상 작동"
else
    echo "❌ GraphQL API 오류"
    echo "응답: $GRAPHQL_RESPONSE"
fi

# 5. 정적 파일 접근 테스트
echo "📁 정적 파일 접근 테스트..."
curl -s -o /dev/null -w "정적 파일 응답 코드: %{http_code}\n" https://ta-go.shop/_next/static/chunks/vendors-5a84622074cdb27d.js

# 6. DNS 확인
echo "🌐 DNS 확인..."
nslookup ta-go.shop

# 7. 포트 확인
echo "🔌 포트 확인..."
echo "포트 80 (HTTP): $(netstat -tlnp | grep :80 || echo '포트 80 사용 중')"
echo "포트 443 (HTTPS): $(netstat -tlnp | grep :443 || echo '포트 443 사용 중')"

# 8. Nginx 로그 확인
echo "📝 Nginx 로그 확인 (최근 5줄)..."
docker-compose logs --tail=5 nginx

# 9. 백엔드 API 직접 테스트
echo "🔧 백엔드 API 직접 테스트 (72.60.40.57:3001)..."
BACKEND_RESPONSE=$(curl -s -X POST http://72.60.40.57:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __schema { types { name } } }"}')

if echo "$BACKEND_RESPONSE" | grep -q "Member"; then
    echo "✅ 백엔드 API 정상 작동"
else
    echo "❌ 백엔드 API 오류"
    echo "응답: $BACKEND_RESPONSE"
fi

echo "✅ ta-go.shop 도메인 테스트가 완료되었습니다."
echo "📝 브라우저에서 https://ta-go.shop 에 접속하여 확인해보세요."
