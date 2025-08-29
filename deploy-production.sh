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

# 4. 환경 변수 파일 업데이트
echo "🔧 환경 변수 파일 업데이트..."
cat > env.production << 'ENVEOF'
# 프로덕션 환경 변수 설정
NODE_ENV=production

# API URLs
NEXT_PUBLIC_API_URL=http://ta-go.shop
NEXT_PUBLIC_API_GRAPHQL_URL=http://ta-go.shop/graphql
NEXT_PUBLIC_API_WS=ws://ta-go.shop

# 서버 설정
PORT=3011
HOSTNAME=0.0.0.0

# Authentication
NEXTAUTH_URL=http://ta-go.shop
NEXTAUTH_SECRET=your-production-secret-key-here

# OAuth Providers (실제 값으로 교체 필요)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
ENVEOF

# 5. Node.js 및 Yarn 설치 확인
echo "🔧 Node.js 및 Yarn 설치 확인..."
if ! command -v yarn &> /dev/null; then
    echo "📦 Yarn 설치 중..."
    npm install -g yarn
fi

# 6. 의존성 설치 (legacy-peer-deps 플래그 사용)
echo "📦 의존성 설치..."
npm install --legacy-peer-deps

# 7. 프론트엔드 빌드
echo "🔨 프론트엔드 빌드..."
npm run build

# 8. 백엔드 디렉토리로 이동
echo "🔄 백엔드 설정..."
cd server

# 9. 백엔드 의존성 설치
echo "📦 백엔드 의존성 설치..."
npm install

# 10. PM2 프로세스 확인 및 시작
echo "🚀 PM2 프로세스 시작..."
if pm2 list | grep -q "ta-go-backend"; then
    echo "🔄 백엔드 재시작..."
    pm2 restart ta-go-backend
else
    echo "🆕 백엔드 프로세스 시작..."
    pm2 start backend.js --name ta-go-backend
fi

# 11. 프론트엔드 프로세스 시작
cd ..
if pm2 list | grep -q "ta-go-frontend"; then
    echo "🔄 프론트엔드 재시작..."
    pm2 restart ta-go-frontend
else
    echo "🆕 프론트엔드 프로세스 시작..."
    pm2 start npm --name ta-go-frontend -- start
fi

# 12. PM2 설정 저장
echo "💾 PM2 설정 저장..."
pm2 save

# 13. 상태 확인
echo "📊 서비스 상태 확인..."
pm2 status

# 14. 환경 변수 확인
echo "🔍 환경 변수 확인..."
echo "=== env.production 내용 ==="
cat env.production
echo "=========================="

echo "✅ 배포 완료!"
EOF

echo "🎉 프로덕션 배포가 완료되었습니다!"
