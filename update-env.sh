#!/bin/bash

# 환경 변수 업데이트 스크립트
echo "🔧 환경 변수를 업데이트합니다..."

# 환경 변수 파일 확인
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local 파일이 없습니다. env.example을 복사하세요."
    exit 1
fi

# 프론트엔드 컨테이너 재시작 (환경 변수 적용)
echo "🔄 프론트엔드 컨테이너를 재시작합니다..."
docker-compose restart ta-go-frontend

# 상태 확인
echo "🏥 서비스 상태를 확인합니다..."
sleep 3
docker-compose ps ta-go-frontend

echo "✅ 환경 변수 업데이트가 완료되었습니다!"
echo "🌐 프론트엔드: http://72.60.40.57:3011"
