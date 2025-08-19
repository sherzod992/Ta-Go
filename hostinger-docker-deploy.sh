#!/bin/bash

# Hostinger VPS Docker 배포 스크립트

echo "🐳 Hostinger VPS Docker 배포 시작..."

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 프로젝트 디렉토리 생성
sudo mkdir -p /var/www/ta-go
sudo chown $USER:$USER /var/www/ta-go

# 프로젝트 파일 복사
# git clone https://github.com/your-username/ta-go.git /var/www/ta-go

# 환경 변수 설정
cd /var/www/ta-go
cp env.example .env
# .env 파일을 편집하여 실제 값으로 설정

# Docker 이미지 빌드 및 실행
docker-compose up -d --build

# Nginx 설정 (Docker 컨테이너용)
sudo tee /etc/nginx/sites-available/ta-go-docker << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Nginx 설치 및 설정
sudo apt install nginx -y
sudo ln -s /etc/nginx/sites-available/ta-go-docker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL 인증서 설치
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

echo "✅ Docker 배포 완료!"
echo "🌐 https://your-domain.com 에서 확인하세요"
