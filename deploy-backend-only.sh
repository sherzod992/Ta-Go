#!/bin/bash

# 백엔드만 배포하는 스크립트
echo "🚀 ta-Go 백엔드 배포 시작..."

# 1. 프로덕션 서버에 접속
echo "📡 프로덕션 서버에 접속 중..."
ssh root@72.60.40.57 << 'EOF'

# 2. 프로젝트 디렉토리로 이동
cd /var/www/ta-go

# 3. 최신 코드 가져오기
echo "📥 최신 코드 가져오기..."
git pull origin main

# 4. 백엔드 디렉토리로 이동
echo "🔄 백엔드 설정..."
cd server

# 5. 백엔드 의존성 설치
echo "📦 백엔드 의존성 설치..."
npm install

# 6. 백엔드 재시작
echo "🔄 백엔드 재시작..."
pm2 restart ta-go-backend

# 7. 백엔드 로그 확인
echo "📊 백엔드 로그 확인..."
pm2 logs ta-go-backend --lines 10

echo "✅ 백엔드 배포 완료!"
EOF

echo "�� 백엔드 배포가 완료되었습니다!"
