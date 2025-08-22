#!/bin/bash

# 빠른 업데이트 스크립트
echo "⚡ TA-GO 빠른 업데이트를 시작합니다..."

# 변경사항 확인
echo "📝 Git 상태를 확인합니다..."
git status

# 변경사항이 있으면 커밋
if [[ -n $(git status --porcelain) ]]; then
    echo "💾 변경사항을 커밋합니다..."
    git add .
    git commit -m "자동 업데이트: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 프론트엔드만 재빌드 및 재시작
echo "🔨 프론트엔드를 재빌드합니다..."
docker-compose build --no-cache ta-go-frontend

echo "🚀 프론트엔드를 재시작합니다..."
docker-compose up -d ta-go-frontend

# 헬스체크
echo "🏥 서비스 상태를 확인합니다..."
sleep 5

# 상태 확인
docker-compose ps ta-go-frontend

echo "✅ 빠른 업데이트가 완료되었습니다!"
echo "🌐 프론트엔드: http://72.60.40.57:3011"
echo "📊 로그 확인: docker-compose logs -f ta-go-frontend"
