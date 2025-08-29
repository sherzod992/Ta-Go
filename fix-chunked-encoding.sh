#!/bin/bash

# 청크 인코딩 오류 해결 스크립트
echo "🔧 청크 인코딩 오류 해결을 시작합니다..."

# 1. 기존 컨테이너 중지 및 제거
echo "📦 기존 컨테이너를 중지하고 제거합니다..."
docker-compose down

# 2. Docker 시스템 정리
echo "🧹 Docker 시스템을 정리합니다..."
docker system prune -f
docker volume prune -f

# 3. 이미지 재빌드
echo "🔨 이미지를 재빌드합니다..."
docker-compose build --no-cache

# 4. 컨테이너 시작
echo "🚀 컨테이너를 시작합니다..."
docker-compose up -d

# 5. 헬스체크 대기
echo "⏳ 서비스가 준비될 때까지 대기합니다..."
sleep 30

# 6. 서비스 상태 확인
echo "📊 서비스 상태를 확인합니다..."
docker-compose ps

# 7. 로그 확인
echo "📋 최근 로그를 확인합니다..."
docker-compose logs --tail=50

# 8. 네트워크 연결 테스트
echo "🌐 네트워크 연결을 테스트합니다..."
curl -f http://localhost/health || echo "❌ 헬스체크 실패"
curl -f http://localhost:3011/health || echo "❌ 프론트엔드 헬스체크 실패"

echo "✅ 청크 인코딩 오류 해결 작업이 완료되었습니다."
echo "📝 추가 문제가 있다면 로그를 확인하세요: docker-compose logs -f"
