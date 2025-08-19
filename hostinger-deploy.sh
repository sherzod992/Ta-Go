#!/bin/bash

# Hostinger VPS 배포 스크립트 (GitHub 연동용)

echo "🚀 Hostinger VPS 배포 시작..."

# 프로젝트 디렉토리로 이동
cd /var/www/ta-go

# Git 상태 확인
if [ ! -d ".git" ]; then
    echo "❌ Git 저장소가 아닙니다. GitHub에서 클론해주세요."
    echo "   git clone https://github.com/your-username/ta-go.git ."
    exit 1
fi

# 기존 프로세스 중지
echo "🛑 기존 프로세스 중지 중..."
pm2 stop ta-go 2>/dev/null || true
pm2 delete ta-go 2>/dev/null || true

# 최신 코드 가져오기
echo "📥 최신 코드 가져오는 중..."
git fetch origin
git reset --hard origin/main

# 의존성 설치
echo "📦 의존성 설치 중..."
npm ci

# 환경 변수 설정 확인
if [ ! -f .env ]; then
    echo "⚠️  .env 파일이 없습니다. 환경 변수 설정 스크립트를 실행합니다."
    chmod +x hostinger-env-setup.sh
    ./hostinger-env-setup.sh
    echo "📝 .env 파일을 편집하여 실제 값으로 설정해주세요."
    echo "   nano .env"
    read -p "계속하려면 Enter를 누르세요..."
fi

# 프로덕션 빌드
echo "🔨 프로덕션 빌드 중..."
npm run build

# PM2로 애플리케이션 시작
echo "🚀 PM2로 애플리케이션 시작 중..."
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# PM2 상태 확인
echo "📊 PM2 상태 확인:"
pm2 status

# Nginx 설정 확인
echo "🌐 Nginx 상태 확인:"
sudo systemctl status nginx --no-pager -l

echo "✅ 애플리케이션 배포 완료!"
echo "🌐 http://$(hostname -I | awk '{print $1}') 에서 확인하세요"
