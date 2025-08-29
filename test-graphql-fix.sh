#!/bin/bash

# GraphQL 오류 해결 테스트 스크립트
echo "🔍 GraphQL 오류 해결 테스트를 시작합니다..."

# 1. 서비스 상태 확인
echo "📊 서비스 상태 확인..."
docker-compose ps

# 2. 백엔드 GraphQL 스키마 확인
echo "🔧 백엔드 GraphQL 스키마 확인..."
echo "사용 가능한 타입들:"
curl -s -X POST http://72.60.40.57:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __schema { types { name } } }"}' | \
  jq -r '.data.__schema.types[].name' | grep -E "(Member|Signup|Login)" | head -10

# 3. MemberInput 타입 확인
echo "📋 MemberInput 타입 필드 확인..."
curl -s -X POST http://72.60.40.57:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __type(name: \"MemberInput\") { name inputFields { name type { name } } } }"}' | \
  jq '.data.__type.inputFields[] | "\(.name): \(.type.name)"'

# 4. Member 타입 확인
echo "📋 Member 타입 필드 확인..."
curl -s -X POST http://72.60.40.57:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __type(name: \"Member\") { name fields { name type { name } } } }"}' | \
  jq '.data.__type.fields[] | "\(.name): \(.type.name)"' | head -10

# 5. 테스트 회원가입 요청
echo "🧪 테스트 회원가입 요청..."
TEST_SIGNUP_RESPONSE=$(curl -s -X POST http://72.60.40.57:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Signup($input: MemberInput!) { signup(input: $input) { _id memberNick memberEmail accessToken } }",
    "variables": {
      "input": {
        "memberNick": "testuser123",
        "memberPassword": "testpass123",
        "memberEmail": "test@example.com",
        "memberType": "USER",
        "memberAuthType": "EMAIL"
      }
    }
  }')

echo "회원가입 응답:"
echo "$TEST_SIGNUP_RESPONSE" | jq '.'

# 6. 프론트엔드 접근 테스트
echo "🌐 프론트엔드 접근 테스트..."
curl -s -o /dev/null -w "프론트엔드 응답 코드: %{http_code}\n" http://localhost:3011

# 7. Nginx를 통한 접근 테스트
echo "🌐 Nginx를 통한 접근 테스트..."
curl -s -o /dev/null -w "Nginx 응답 코드: %{http_code}\n" http://localhost

# 8. 로그 확인
echo "📝 최근 로그 확인..."
echo "프론트엔드 로그 (최근 5줄):"
docker-compose logs --tail=5 ta-go-frontend

echo "✅ GraphQL 오류 해결 테스트가 완료되었습니다."
echo "📝 브라우저에서 http://localhost 에 접속하여 회원가입 기능을 테스트해보세요."
