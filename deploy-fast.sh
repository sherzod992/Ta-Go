#!/bin/bash

# 빠른 배포 스크립트 (캐시 활용)
echo "⚡ TA-GO 빠른 배포를 시작합니다..."

# 환경 변수 설정
export BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

echo "📅 빌드 타임스탬프: $BUILD_DATE"

# 1. 기존 컨테이너만 재시작 (빌드 없이)
echo "🔄 컨테이너를 재시작합니다..."
docker-compose restart ta-go-frontend

# 2. 헬스체크 대기 (짧게)
echo "⏳ 서비스 시작을 기다립니다..."
sleep 5

# 3. 서비스 상태 확인
echo "🏥 서비스 상태를 확인합니다..."
docker-compose ps

# 4. 로그 확인
echo "📋 최근 로그:"
docker-compose logs --tail=5 ta-go-frontend

# 5. 접속 테스트
echo "🌐 접속 테스트:"
curl -s -o /dev/null -w "응답시간: %{time_total}초\nHTTP 상태: %{http_code}\n" http://localhost:3011

echo "✅ 빠른 배포가 완료되었습니다!"
echo "🌐 프론트엔드: http://localhost:3011"
echo "💡 팁: 코드 수정 후 이 스크립트를 사용하면 빠릅니다!"
