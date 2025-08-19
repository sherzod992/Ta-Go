#!/bin/bash

# Hostinger VPS 초기 설정 스크립트 (GitHub 연동 배포용)

echo "🚀 Hostinger VPS 초기 설정 시작..."

# VPS IP 주소 자동 감지
VPS_IP=$(hostname -I | awk '{print $1}')
echo "🔍 감지된 VPS IP: $VPS_IP"

# 시스템 업데이트
echo "📦 시스템 업데이트 중..."
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
echo "📦 필수 패키지 설치 중..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Node.js 18 설치
echo "📦 Node.js 18 설치 중..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Node.js 버전 확인
echo "✅ Node.js 버전: $(node --version)"
echo "✅ npm 버전: $(npm --version)"

# PM2 설치 (프로세스 관리)
echo "📦 PM2 설치 중..."
sudo npm install -g pm2

# Nginx 설치
echo "📦 Nginx 설치 중..."
sudo apt install nginx -y

# UFW 방화벽 설정
echo "🔒 방화벽 설정 중..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3000  # 백엔드
sudo ufw allow 3011  # 프론트엔드
sudo ufw --force enable

# 프로젝트 디렉토리 생성
echo "📁 프로젝트 디렉토리 생성 중..."
sudo mkdir -p /var/www/ta-ja    # 백엔드
sudo mkdir -p /var/www/ta-go    # 프론트엔드
sudo chown $USER:$USER /var/www/ta-ja
sudo chown $USER:$USER /var/www/ta-go

# 백엔드 설정
echo "🔧 백엔드 설정 중..."
cd /var/www/ta-ja
git init

# 백엔드 PM2 설정 파일 생성
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ta-ja-backend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/ta-ja',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# 프론트엔드 설정
echo "🔧 프론트엔드 설정 중..."
cd /var/www/ta-go
git init

# 프론트엔드 PM2 설정 파일 생성
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ta-go',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/ta-go',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3011
    }
  }]
}
EOF

# Nginx 기본 설정 비활성화
sudo rm -f /etc/nginx/sites-enabled/default

echo "✅ 초기 설정 완료!"
echo "📋 다음 단계:"
echo "1. 백엔드 저장소 클론: cd /var/www/ta-ja && git clone https://github.com/sherzod992/-GO.git ."
echo "2. 프론트엔드 저장소 클론: cd /var/www/ta-go && git clone [프론트엔드-저장소-URL] ."
echo "3. 환경 변수 설정"
echo "4. GitHub Secrets 설정"
echo "5. 첫 번째 배포 실행"
