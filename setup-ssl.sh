#!/bin/bash

# DNS 변경 후 SSL 인증서 발급 스크립트
# 실행 전 DNS가 72.60.40.57로 변경되었는지 확인하세요

echo "🔍 DNS 설정 확인 중..."
echo "ta-go.shop: $(dig ta-go.shop +short)"
echo "www.ta-go.shop: $(dig www.ta-go.shop +short)"

echo ""
echo "📋 SSL 인증서 발급 시작..."

# SSL 인증서 발급
ssh root@72.60.40.57 "certbot --nginx -d ta-go.shop -d www.ta-go.shop --non-interactive --agree-tos --email admin@ta-go.shop"

echo ""
echo "✅ SSL 인증서 발급 완료!"
echo "🌐 https://ta-go.shop 으로 접속해보세요"
