# ta-Go 개발 환경 가이드

## 🚀 빠른 시작

### 1. Localhost 환경 (전체 로컬 개발)

```bash
# 전체 로컬 환경 실행 (프론트엔드 + 백엔드)
./dev-local.sh

# 또는 npm 스크립트 사용
npm run full:local
```

**포트 구성:**
- 프론트엔드: `http://localhost:3011`
- 백엔드: `http://localhost:3000`
- GraphQL: `http://localhost:3000/graphql`

### 2. Docker 환경 (Docker Desktop 필요)

```bash
# Docker 환경 실행 (프론트엔드 + Docker 백엔드)
./dev-docker.sh

# 또는 npm 스크립트 사용
npm run full:docker
```

**포트 구성:**
- 프론트엔드: `http://localhost:3011`
- 백엔드: `http://localhost:3001` (Docker)
- GraphQL: `http://localhost:3001/graphql`

### 3. 원격 서버 환경 (프론트엔드만 로컬)

```bash
# 원격 서버 환경 실행 (프론트엔드만 로컬)
./dev-remote.sh

# 또는 npm 스크립트 사용
npm run full:remote
```

**포트 구성:**
- 프론트엔드: `http://localhost:3011`
- 백엔드: `http://72.60.40.57:3001` (원격)
- GraphQL: `http://72.60.40.57:3001/graphql`

## 🔧 개별 실행 방법

### 프론트엔드만 실행

```bash
# 기본 실행 (원격 서버 사용)
npm run dev

# localhost 백엔드 사용
npm run dev:local

# 원격 백엔드 사용
npm run dev:remote
```

### 백엔드만 실행

```bash
# localhost 백엔드 실행
npm run backend:dev

# 또는 직접 실행
cd server
npm run dev:local
```

## 📦 빌드 및 배포

### 로컬 환경용 빌드

```bash
# localhost 백엔드용 빌드
npm run build:local
```

### 원격 서버용 빌드

```bash
# 원격 백엔드용 빌드
npm run build:remote
```

### 정적 배포용 빌드

```bash
npm run build:static
```

## 🌍 환경 변수 설정

### .env.local 파일 생성

```bash
# API URLs
NEXT_PUBLIC_API_URL=http://72.60.40.57:3001
NEXT_PUBLIC_API_GRAPHQL_URL=http://72.60.40.57:3001/graphql
NEXT_PUBLIC_API_WS=ws://72.60.40.57:3001

# Local Development URLs
NEXT_PUBLIC_LOCAL_API_URL=http://localhost:3000
NEXT_PUBLIC_LOCAL_WS_URL=ws://localhost:3000
NEXT_PUBLIC_USE_LOCAL=false

# Remote Development URLs
NEXT_PUBLIC_REMOTE_API_URL=http://72.60.40.57:3001
NEXT_PUBLIC_REMOTE_WS_URL=ws://72.60.40.57:3001
```

## 🔄 환경 전환

### localhost ↔ 원격 서버 전환

1. **환경 변수로 전환:**
   ```bash
   # localhost 사용
   export NEXT_PUBLIC_USE_LOCAL=true
   
   # 원격 서버 사용
   export NEXT_PUBLIC_USE_LOCAL=false
   ```

2. **스크립트로 전환:**
   ```bash
   # localhost 환경
   npm run dev:local
   
   # 원격 서버 환경
   npm run dev:remote
   ```

## 🛠️ 개발 팁

### 포트 충돌 방지

- 프론트엔드: `3011` 포트
- 백엔드: `3000` 포트
- 각각 다른 포트를 사용하여 충돌 방지

### 의존성 설치

```bash
# 프론트엔드 의존성
npm install

# 백엔드 의존성
npm run backend:install
```

### 로그 확인

```bash
# 프론트엔드 로그
npm run dev

# 백엔드 로그
npm run backend:dev
```

## 🚨 문제 해결

### 포트가 이미 사용 중인 경우

```bash
# 포트 사용 확인
lsof -i :3000
lsof -i :3011

# 프로세스 종료
kill -9 [PID]
```

### CORS 오류

- 백엔드 서버의 CORS 설정 확인
- `server/backend.js`의 `allowedOrigins` 배열 확인

### GraphQL 연결 오류

- Apollo Client 설정 확인 (`apollo/client.ts`)
- 환경 변수 설정 확인
- 네트워크 연결 상태 확인

## 📝 개발 워크플로우

1. **로컬 개발:**
   ```bash
   ./dev-local.sh
   ```

2. **Docker 개발:**
   ```bash
   ./dev-docker.sh
   ```

3. **원격 서버 테스트:**
   ```bash
   ./dev-remote.sh
   ```

4. **빌드 및 배포:**
   ```bash
   npm run build:remote
   npm run start
   ```

## 🔗 유용한 링크

- **프론트엔드:** http://localhost:3011
- **백엔드 (로컬):** http://localhost:3000
- **백엔드 (원격):** http://72.60.40.57:3001
- **GraphQL Playground:** http://localhost:3000/graphql
- **Health Check:** http://localhost:3000/health
