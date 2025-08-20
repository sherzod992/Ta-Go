# 🐳 Ta-Go Docker 배포 가이드

## 📋 개요
이 가이드는 Ta-Go 프로젝트를 Docker를 사용하여 배포하는 방법을 설명합니다.

## 🏗️ 아키텍처
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (80)    │    │  Frontend       │    │  API Server     │
│   (Reverse      │◄──►│  (Port 3011)    │◄──►│  (Port 3012)    │
│   Proxy)        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   MongoDB       │    │   PostgreSQL    │
                       │   (Port 27017)  │    │   (Port 5432)   │
                       └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   Redis         │
                                              │   (Port 6379)   │
                                              └─────────────────┘
```

## 🚀 배포 단계

### 1. 환경 변수 설정
```bash
# env.docker 파일을 .env로 복사
cp env.docker .env

# 실제 값으로 환경 변수 수정
nano .env
```

### 2. 전체 서비스 빌드 및 시작
```bash
# 모든 서비스 빌드
docker-compose build

# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 3. 개별 서비스 관리
```bash
# 프론트엔드만 재빌드
docker-compose build ta-go-frontend
docker-compose up -d ta-go-frontend

# API 서버만 재시작
docker-compose restart ta-ja-api

# 특정 서비스 로그 확인
docker-compose logs -f ta-go-frontend
docker-compose logs -f ta-ja-api
```

### 4. 서비스 상태 확인
```bash
# 모든 서비스 상태 확인
docker-compose ps

# 헬스체크 확인
docker-compose ps | grep healthy
```

## 🌐 접속 URL

### 개발 환경
- **프론트엔드**: http://localhost:3011
- **API 직접 접속**: http://localhost:3012/graphql
- **GraphQL Playground**: http://localhost:3012/graphql

### 프로덕션 환경 (Nginx 사용)
- **메인 사이트**: http://localhost (또는 도메인)
- **API 엔드포인트**: http://localhost/graphql

## 🔧 환경별 설정

### 개발 환경
```bash
# 데이터베이스만 실행
docker-compose up -d ta-ja-mongodb ta-ja-postgres ta-ja-redis

# 프론트엔드는 로컬에서 실행
npm run dev
```

### 프로덕션 환경
```bash
# 모든 서비스 실행
docker-compose up -d

# Nginx를 통한 통합 서비스
# http://your-domain.com 으로 접속
```

## 🛠️ 문제 해결

### CORS 오류
```bash
# API 서버 CORS 설정 확인
docker-compose logs ta-ja-api | grep CORS

# 프론트엔드 환경 변수 확인
docker-compose exec ta-go-frontend env | grep NEXT_PUBLIC
```

### WebSocket 연결 실패
```bash
# WebSocket 연결 상태 확인
docker-compose logs ta-ja-api | grep WebSocket

# Nginx WebSocket 프록시 설정 확인
docker-compose logs nginx | grep upgrade
```

### 데이터베이스 연결 실패
```bash
# MongoDB 연결 확인
docker-compose exec ta-ja-mongodb mongosh

# PostgreSQL 연결 확인
docker-compose exec ta-ja-postgres psql -U ta_ja_user -d ta_ja_db

# Redis 연결 확인
docker-compose exec ta-ja-redis redis-cli ping
```

### 포트 충돌
```bash
# 사용 중인 포트 확인
netstat -tulpn | grep :3011
netstat -tulpn | grep :3012

# 충돌하는 서비스 중지
sudo systemctl stop nginx  # 예시
```

## 📊 모니터링

### 리소스 사용량 확인
```bash
# 컨테이너 리소스 사용량
docker stats

# 특정 컨테이너 상세 정보
docker inspect ta-go-frontend
```

### 로그 분석
```bash
# 실시간 로그 모니터링
docker-compose logs -f --tail=100

# 에러 로그만 확인
docker-compose logs | grep ERROR

# 특정 시간대 로그
docker-compose logs --since="2024-01-01T00:00:00"
```

## 🔄 업데이트 및 배포

### 코드 업데이트
```bash
# 코드 변경 후 재빌드
git pull origin main
docker-compose build
docker-compose up -d

# 또는 특정 서비스만 업데이트
docker-compose build ta-go-frontend
docker-compose up -d ta-go-frontend
```

### 데이터베이스 백업
```bash
# MongoDB 백업
docker-compose exec ta-ja-mongodb mongodump --out /backup

# PostgreSQL 백업
docker-compose exec ta-ja-postgres pg_dump -U ta_ja_user ta_ja_db > backup.sql
```

## 🧹 정리

### 서비스 중지
```bash
# 모든 서비스 중지
docker-compose down

# 볼륨까지 삭제 (데이터 손실 주의!)
docker-compose down -v
```

### 이미지 정리
```bash
# 사용하지 않는 이미지 삭제
docker image prune -a

# 사용하지 않는 볼륨 삭제
docker volume prune
```

## 📝 주의사항

1. **환경 변수**: 실제 배포 시 `env.docker`의 모든 값들을 실제 값으로 변경
2. **보안**: 프로덕션에서는 강력한 비밀번호와 JWT 시크릿 사용
3. **SSL**: 프로덕션에서는 HTTPS 설정 필수
4. **백업**: 정기적인 데이터베이스 백업 권장
5. **모니터링**: 로그 모니터링 및 알림 설정 권장

## 🆘 지원

문제가 발생하면 다음을 확인하세요:
1. Docker 및 Docker Compose 버전
2. 포트 충돌 여부
3. 환경 변수 설정
4. 네트워크 연결 상태
5. 로그 파일 내용
