#!/bin/bash

# Hostinger VPS Nginx 설정 스크립트 (GitHub 연동 배포용)

echo "🌐 Nginx 설정 시작..."

# VPS IP 주소 자동 감지
VPS_IP=$(hostname -I | awk '{print $1}')
echo "🔍 감지된 VPS IP: $VPS_IP"

# 도메인 입력 받기 (선택사항)
read -p "도메인이 있으면 입력하세요 (없으면 Enter): " DOMAIN

if [ -z "$DOMAIN" ]; then
    SERVER_NAME="$VPS_IP"
    echo "📝 IP 주소로 설정: $SERVER_NAME"
else
    SERVER_NAME="$DOMAIN www.$DOMAIN"
    echo "📝 도메인으로 설정: $SERVER_NAME"
fi

# Nginx 설정 파일 생성
echo "📝 Nginx 설정 파일 생성 중..."
sudo tee /etc/nginx/sites-available/ta-ja << EOF
server {
    listen 80;
    server_name $SERVER_NAME;

    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3011;
    }

    # Next.js 애플리케이션 프록시 (프론트엔드)
    location / {
        proxy_pass http://localhost:3011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # API 프록시 (백엔드)
    location /api/ {
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

    # GraphQL 프록시
    location /graphql {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket 지원
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 백엔드 헬스체크
    location /health {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 사이트 활성화
sudo ln -sf /etc/nginx/sites-available/ta-ja /etc/nginx/sites-enabled/

# Nginx 설정 테스트
echo "🔍 Nginx 설정 테스트 중..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx 설정이 유효합니다."
    
    # Nginx 재시작
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    echo "✅ Nginx 설정 완료!"
    echo "🌐 http://$VPS_IP 에서 확인하세요"
    
    # SSL 인증서 설치 여부 확인 (도메인이 있는 경우만)
    if [ ! -z "$DOMAIN" ]; then
        read -p "SSL 인증서를 설치하시겠습니까? (y/n): " INSTALL_SSL
        
        if [ "$INSTALL_SSL" = "y" ] || [ "$INSTALL_SSL" = "Y" ]; then
            echo "🔒 SSL 인증서 설치 중..."
            sudo apt install certbot python3-certbot-nginx -y
            sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
            
            if [ $? -eq 0 ]; then
                echo "✅ SSL 인증서 설치 완료!"
                echo "🔒 https://$DOMAIN 에서 확인하세요"
            else
                echo "❌ SSL 인증서 설치에 실패했습니다."
            fi
        fi
    fi
else
    echo "❌ Nginx 설정에 오류가 있습니다."
    exit 1
fi
