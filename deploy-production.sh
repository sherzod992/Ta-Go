#!/bin/bash

# 프로덕션 서버 배포 스크립트
echo "🚀 ta-Go 프로덕션 서버 배포 시작..."

# 1. 프로덕션 서버에 접속
echo "📡 프로덕션 서버에 접속 중..."
ssh root@72.60.40.57 << 'EOF'

# 2. 프로젝트 디렉토리로 이동
cd /var/www/ta-go

# 3. 최신 코드 강제 가져오기
echo "📥 최신 코드 강제 가져오기..."
git fetch origin main
git reset --hard origin/main

# 4. Node.js 및 Yarn 설치 확인
echo "🔧 Node.js 및 Yarn 설치 확인..."
if ! command -v yarn &> /dev/null; then
    echo "📦 Yarn 설치 중..."
    npm install -g yarn
fi

# 5. 의존성 설치 (legacy-peer-deps 플래그 사용)
echo "📦 의존성 설치..."
npm install --legacy-peer-deps

# 6. 프론트엔드 빌드
echo "🔨 프론트엔드 빌드..."
npm run build

# 7. 백엔드 디렉토리로 이동
echo "🔄 백엔드 설정..."
cd server

# 8. 백엔드 의존성 설치
echo "📦 백엔드 의존성 설치..."
npm install

# 9. PM2 프로세스 확인 및 시작
echo "🚀 PM2 프로세스 시작..."
if pm2 list | grep -q "ta-go-backend"; then
    echo "🔄 백엔드 재시작..."
    pm2 restart ta-go-backend
else
    echo "🆕 백엔드 프로세스 시작..."
    pm2 start backend.js --name ta-go-backend
fi

# 10. 프론트엔드 프로세스 시작
cd ..
if pm2 list | grep -q "ta-go-frontend"; then
    echo "🔄 프론트엔드 재시작..."
    pm2 restart ta-go-frontend
else
    echo "🆕 프론트엔드 프로세스 시작..."
    pm2 start npm --name ta-go-frontend -- start
fi

# 11. PM2 설정 저장
echo "💾 PM2 설정 저장..."
pm2 save

# 12. 상태 확인
echo "📊 서비스 상태 확인..."
pm2 status

echo "✅ 배포 완료!"
EOF

echo "🎉 프로덕션 배포가 완료되었습니다!"
