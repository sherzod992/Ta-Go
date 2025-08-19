#!/bin/bash

# Hostinger VPS 전체 스택 배포 스크립트 (백엔드 + 프론트엔드)

echo "🚀 Hostinger VPS 전체 스택 배포 시작..."

# VPS IP 주소 자동 감지
VPS_IP=$(hostname -I | awk '{print $1}')
echo "🔍 VPS IP: $VPS_IP"

# 백엔드 배포
echo "🔧 백엔드 배포 시작..."
cd /var/www/ta-ja

# Git 상태 확인
if [ ! -d ".git" ]; then
    echo "❌ 백엔드 Git 저장소가 아닙니다. GitHub에서 클론해주세요."
    echo "   cd /var/www/ta-ja && git clone https://github.com/sherzod992/-GO.git ."
    exit 1
fi

# 기존 백엔드 프로세스 중지
echo "🛑 기존 백엔드 프로세스 중지 중..."
pm2 stop ta-ja-backend 2>/dev/null || true
pm2 delete ta-ja-backend 2>/dev/null || true

# 최신 백엔드 코드 가져오기
echo "📥 최신 백엔드 코드 가져오는 중..."
git fetch origin
git reset --hard origin/main

# 백엔드 의존성 설치
echo "📦 백엔드 의존성 설치 중..."
npm ci

# 백엔드 환경 변수 확인
if [ ! -f .env ]; then
    echo "⚠️  백엔드 .env 파일이 없습니다. 환경 변수를 설정해주세요."
    echo "   nano .env"
    read -p "계속하려면 Enter를 누르세요..."
fi

# 백엔드 빌드
echo "🔨 백엔드 빌드 중..."
npm run build

# 백엔드 시작
echo "🚀 백엔드 시작 중..."
pm2 start ecosystem.config.js

# 프론트엔드 배포
echo "🔧 프론트엔드 배포 시작..."
cd /var/www/ta-go

# Git 상태 확인
if [ ! -d ".git" ]; then
    echo "❌ 프론트엔드 Git 저장소가 아닙니다. GitHub에서 클론해주세요."
    echo "   cd /var/www/ta-go && git clone [프론트엔드-저장소-URL] ."
    exit 1
fi

# 기존 프론트엔드 프로세스 중지
echo "🛑 기존 프론트엔드 프로세스 중지 중..."
pm2 stop ta-go 2>/dev/null || true
pm2 delete ta-go 2>/dev/null || true

# 최신 프론트엔드 코드 가져오기
echo "📥 최신 프론트엔드 코드 가져오는 중..."
git fetch origin
git reset --hard origin/main

# 프론트엔드 의존성 설치
echo "📦 프론트엔드 의존성 설치 중..."
npm ci

# 프론트엔드 환경 변수 설정 확인
if [ ! -f .env ]; then
    echo "⚠️  프론트엔드 .env 파일이 없습니다. 환경 변수 설정 스크립트를 실행합니다."
    chmod +x hostinger-env-setup.sh
    ./hostinger-env-setup.sh
    echo "📝 .env 파일을 편집하여 실제 값으로 설정해주세요."
    echo "   nano .env"
    read -p "계속하려면 Enter를 누르세요..."
fi

# 프론트엔드 빌드
echo "🔨 프론트엔드 빌드 중..."
npm run build

# 프론트엔드 시작
echo "🚀 프론트엔드 시작 중..."
pm2 start ecosystem.config.js

# PM2 상태 확인
echo "📊 PM2 상태 확인:"
pm2 status

# Nginx 설정 확인
echo "🌐 Nginx 상태 확인:"
sudo systemctl status nginx --no-pager -l

# 헬스체크
echo "🏥 헬스체크 중..."
sleep 10

# 백엔드 헬스체크
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ 백엔드 헬스체크 통과"
else
    echo "⚠️  백엔드 헬스체크 실패 (서버 시작 중일 수 있음)"
fi

# 프론트엔드 헬스체크
if curl -f http://localhost:3011 > /dev/null 2>&1; then
    echo "✅ 프론트엔드 헬스체크 통과"
else
    echo "⚠️  프론트엔드 헬스체크 실패 (서버 시작 중일 수 있음)"
fi

echo "✅ 전체 스택 배포 완료!"
echo "🌐 프론트엔드: http://$VPS_IP"
echo "🔧 백엔드 API: http://$VPS_IP:3000"
echo "📊 PM2 모니터링: pm2 monit"
