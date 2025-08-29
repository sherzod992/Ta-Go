#!/bin/bash

# 청크 인코딩 오류 해결 테스트 스크립트
echo "🔍 청크 인코딩 오류 해결 테스트를 시작합니다..."

# 1. 서비스 상태 확인
echo "📊 서비스 상태 확인..."
docker-compose ps

# 2. 메인 페이지 접근 테스트
echo "🌐 메인 페이지 접근 테스트..."
curl -s -o /dev/null -w "메인 페이지 응답 코드: %{http_code}\n" http://localhost

# 3. 정적 파일 접근 테스트
echo "📁 정적 파일 접근 테스트..."
STATIC_FILES=(
    "/_next/static/chunks/vendors-5a84622074cdb27d.js"
    "/_next/static/chunks/pages/_app-62f304fea604e363.js"
    "/_next/static/chunks/main-7394f616dca6606c.js"
)

for file in "${STATIC_FILES[@]}"; do
    echo "테스트 중: $file"
    curl -s -o /dev/null -w "  응답 코드: %{http_code}, 크기: %{size_download} bytes\n" "http://localhost$file"
done

# 4. 청크 파일 목록 확인
echo "📋 청크 파일 목록 확인..."
curl -s http://localhost | grep -o '_next/static/chunks/[^"]*\.js' | head -10

# 5. Nginx 로그 확인
echo "📝 Nginx 로그 확인 (최근 10줄)..."
docker-compose logs --tail=10 nginx

# 6. 프론트엔드 로그 확인
echo "📝 프론트엔드 로그 확인 (최근 10줄)..."
docker-compose logs --tail=10 ta-go-frontend

# 7. 네트워크 연결 테스트
echo "🌐 네트워크 연결 테스트..."
echo "포트 80 (Nginx): $(netstat -tlnp | grep :80 || echo '포트 80 사용 중')"
echo "포트 3011 (Frontend): $(netstat -tlnp | grep :3011 || echo '포트 3011 사용 중')"

echo "✅ 청크 인코딩 오류 해결 테스트가 완료되었습니다."
echo "📝 브라우저에서 http://localhost 에 접속하여 개발자 도구의 Network 탭을 확인하세요."
