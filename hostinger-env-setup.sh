#!/bin/bash

# Hostinger VPS 환경 변수 설정 스크립트

echo "🔧 환경 변수 설정 시작..."

# VPS IP 주소 자동 감지
VPS_IP=$(hostname -I | awk '{print $1}')
echo "🔍 감지된 VPS IP: $VPS_IP"

# 프로젝트 디렉토리로 이동
cd /var/www/ta-go

# 환경 변수 파일 생성
if [ ! -f .env ]; then
    echo "📝 .env 파일 생성 중..."
    cp env.example .env
fi

# 환경 변수 업데이트
echo "📝 환경 변수 업데이트 중..."

# API URLs 업데이트
sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://$VPS_IP:3000|g" .env
sed -i "s|NEXT_PUBLIC_API_GRAPHQL_URL=.*|NEXT_PUBLIC_API_GRAPHQL_URL=http://$VPS_IP:3000/graphql|g" .env
sed -i "s|NEXT_PUBLIC_API_WS=.*|NEXT_PUBLIC_API_WS=ws://$VPS_IP:3000|g" .env

# NEXTAUTH_URL 업데이트
sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://$VPS_IP|g" .env

# NEXTAUTH_SECRET 생성 (없는 경우)
if ! grep -q "NEXTAUTH_SECRET=" .env; then
    SECRET=$(openssl rand -base64 32)
    echo "NEXTAUTH_SECRET=$SECRET" >> .env
    echo "✅ NEXTAUTH_SECRET 생성됨"
fi

echo "✅ 환경 변수 설정 완료!"
echo "📋 설정된 값:"
echo "   NEXT_PUBLIC_API_URL: http://$VPS_IP:3000"
echo "   NEXT_PUBLIC_API_GRAPHQL_URL: http://$VPS_IP:3000/graphql"
echo "   NEXT_PUBLIC_API_WS: ws://$VPS_IP:3000"
echo "   NEXTAUTH_URL: http://$VPS_IP"

echo ""
echo "⚠️  다음 값들을 수동으로 설정해주세요:"
echo "   - DATABASE_URL"
echo "   - OAuth Provider 키들 (Google, Facebook, GitHub, Kakao)"
echo ""
echo "편집하려면: nano .env"
