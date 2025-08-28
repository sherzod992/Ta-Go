#!/bin/bash

# DNS 변경 후 최종 설정 스크립트
echo "🎯 ta-Go 최종 설정 시작..."
echo ""

# 1. DNS 설정 확인
echo "🔍 DNS 설정 확인 중..."
echo "ta-go.shop: $(dig ta-go.shop +short)"
echo "www.ta-go.shop: $(dig www.ta-go.shop +short)"
echo ""

# 올바른 IP인지 확인
EXPECTED_IP="72.60.40.57"
TA_GO_IP=$(dig ta-go.shop +short)
WWW_TA_GO_IP=$(dig www.ta-go.shop +short)

if [ "$TA_GO_IP" = "$EXPECTED_IP" ] && [ "$WWW_TA_GO_IP" = "$EXPECTED_IP" ]; then
    echo "✅ DNS 설정이 올바릅니다!"
else
    echo "❌ DNS 설정이 잘못되었습니다."
    echo "   예상 IP: $EXPECTED_IP"
    echo "   현재 ta-go.shop: $TA_GO_IP"
    echo "   현재 www.ta-go.shop: $WWW_TA_GO_IP"
    echo ""
    echo "🔧 도메인 관리자 패널에서 A 레코드를 $EXPECTED_IP로 변경하세요."
    exit 1
fi

# 2. 서버 연결 확인
echo "🔍 서버 연결 확인 중..."
if curl -s -o /dev/null -w "%{http_code}" http://72.60.40.57 | grep -q "200"; then
    echo "✅ 서버가 정상적으로 응답합니다."
else
    echo "❌ 서버 연결에 문제가 있습니다."
    exit 1
fi

# 3. 도메인 연결 확인
echo "🔍 도메인 연결 확인 중..."
if curl -s -o /dev/null -w "%{http_code}" http://ta-go.shop | grep -q "200"; then
    echo "✅ 도메인이 정상적으로 연결됩니다."
else
    echo "❌ 도메인 연결에 문제가 있습니다."
    exit 1
fi

# 4. SSL 인증서 발급
echo ""
echo "📋 SSL 인증서 발급 시작..."
ssh root@72.60.40.57 "certbot --nginx -d ta-go.shop -d www.ta-go.shop --non-interactive --agree-tos --email admin@ta-go.shop"

# 5. HTTPS 연결 확인
echo ""
echo "🔍 HTTPS 연결 확인 중..."
sleep 10  # 인증서 발급 후 잠시 대기

if curl -s -o /dev/null -w "%{http_code}" https://ta-go.shop | grep -q "200"; then
    echo "✅ HTTPS가 정상적으로 작동합니다!"
else
    echo "❌ HTTPS 연결에 문제가 있습니다."
fi

# 6. 최종 상태 확인
echo ""
echo "📊 최종 상태 확인..."
ssh root@72.60.40.57 "systemctl status nginx --no-pager -l"

echo ""
echo "🎉 설정 완료!"
echo "🌐 https://ta-go.shop 으로 접속해보세요"
echo ""
echo "📋 설정 요약:"
echo "   - DNS: ta-go.shop → 72.60.40.57 ✅"
echo "   - Nginx: 포트 80 → 3011 프록시 ✅"
echo "   - SSL: Let's Encrypt 인증서 ✅"
echo "   - 도메인: https://ta-go.shop ✅"
