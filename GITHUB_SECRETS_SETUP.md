# GitHub Secrets 설정 가이드 (전체 스택)

## 📋 필요한 GitHub Secrets

GitHub 저장소 → Settings → Secrets and variables → Actions에서 다음 Secrets를 설정해야 합니다.

### 1. VPS 연결 정보

#### VPS_HOST
- **값**: `72.60.40.57`
- **설명**: VPS의 IP 주소

#### VPS_USERNAME
- **값**: VPS 사용자명 (예: `root` 또는 `ubuntu`)
- **설명**: SSH 접속 사용자명

#### VPS_SSH_KEY (권장)
- **값**: SSH 개인키 내용
- **설명**: SSH 키 인증용 (비밀번호보다 안전)

#### VPS_PASSWORD (대안)
- **값**: VPS 비밀번호
- **설명**: SSH 키가 없는 경우 사용

### 2. 백엔드 관련 Secrets

#### DATABASE_URL
- **값**: `your-database-connection-string`
- **설명**: 데이터베이스 연결 문자열

#### JWT_SECRET
- **값**: `your-jwt-secret-key`
- **설명**: JWT 토큰 암호화 키

#### BACKEND_PORT
- **값**: `3000`
- **설명**: 백엔드 서버 포트

### 3. 프론트엔드 환경 변수

#### NEXT_PUBLIC_API_URL
- **값**: `http://72.60.40.57:3000`
- **설명**: 백엔드 API URL

#### NEXT_PUBLIC_API_GRAPHQL_URL
- **값**: `http://72.60.40.57:3000/graphql`
- **설명**: GraphQL API URL

#### NEXT_PUBLIC_API_WS
- **값**: `ws://72.60.40.57:3000`
- **설명**: WebSocket 연결 URL

### 4. OAuth Provider Secrets (선택사항)

#### GOOGLE_CLIENT_ID
- **값**: `your-google-client-id`
- **설명**: Google OAuth 클라이언트 ID

#### GOOGLE_CLIENT_SECRET
- **값**: `your-google-client-secret`
- **설명**: Google OAuth 클라이언트 시크릿

#### FACEBOOK_CLIENT_ID
- **값**: `your-facebook-client-id`
- **설명**: Facebook OAuth 클라이언트 ID

#### FACEBOOK_CLIENT_SECRET
- **값**: `your-facebook-client-secret`
- **설명**: Facebook OAuth 클라이언트 시크릿

#### GITHUB_CLIENT_ID
- **값**: `your-github-client-id`
- **설명**: GitHub OAuth 클라이언트 ID

#### GITHUB_CLIENT_SECRET
- **값**: `your-github-client-secret`
- **설명**: GitHub OAuth 클라이언트 시크릿

#### KAKAO_CLIENT_ID
- **값**: `your-kakao-client-id`
- **설명**: Kakao OAuth 클라이언트 ID

#### KAKAO_CLIENT_SECRET
- **값**: `your-kakao-client-secret`
- **설명**: Kakao OAuth 클라이언트 시크릿

## 🔧 SSH 키 생성 방법

### 1. 로컬에서 SSH 키 생성
```bash
# SSH 키 생성
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 공개키 확인
cat ~/.ssh/id_rsa.pub

# 개인키 확인
cat ~/.ssh/id_rsa
```

### 2. VPS에 공개키 등록
```bash
# VPS에 SSH 접속
ssh username@72.60.40.57

# 공개키를 authorized_keys에 추가
echo "your-public-key-content" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. GitHub Secrets에 개인키 등록
- GitHub 저장소 → Settings → Secrets and variables → Actions
- "New repository secret" 클릭
- Name: `VPS_SSH_KEY`
- Value: 개인키 전체 내용 (-----BEGIN OPENSSH PRIVATE KEY----- 부터 -----END OPENSSH PRIVATE KEY----- 까지)

## 📝 Secrets 설정 순서

### 필수 Secrets (우선순위)
1. **VPS_HOST** 설정
   - Name: `VPS_HOST`
   - Value: `72.60.40.57`

2. **VPS_USERNAME** 설정
   - Name: `VPS_USERNAME`
   - Value: VPS 사용자명

3. **VPS_SSH_KEY** 설정 (권장)
   - Name: `VPS_SSH_KEY`
   - Value: SSH 개인키 전체 내용

4. **환경 변수** 설정
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `http://72.60.40.57:3000`
   
   - Name: `NEXT_PUBLIC_API_GRAPHQL_URL`
   - Value: `http://72.60.40.57:3000/graphql`
   
   - Name: `NEXT_PUBLIC_API_WS`
   - Value: `ws://72.60.40.57:3000`

### 백엔드 Secrets
5. **DATABASE_URL** 설정
   - Name: `DATABASE_URL`
   - Value: 데이터베이스 연결 문자열

6. **JWT_SECRET** 설정
   - Name: `JWT_SECRET`
   - Value: JWT 암호화 키

### OAuth Secrets (선택사항)
7. **OAuth Provider 키들** 설정
   - Google, Facebook, GitHub, Kakao 클라이언트 ID/시크릿

## ✅ 설정 확인

모든 Secrets 설정 후:

1. GitHub 저장소의 Actions 탭으로 이동
2. "Deploy to VPS (Full Stack)" 워크플로우 확인
3. main 브랜치에 푸시하여 자동 배포 테스트

## 🚨 주의사항

- SSH 키는 절대 공개하지 마세요
- Secrets 값에 따옴표를 사용하지 마세요
- VPS IP 주소가 변경되면 모든 관련 Secrets를 업데이트하세요
- 백엔드와 프론트엔드 저장소가 모두 설정되어 있는지 확인하세요
- 데이터베이스 연결이 정상적인지 확인하세요

## 🔄 워크플로우 선택

### 옵션 1: 전체 스택 배포 (권장)
- 워크플로우: `deploy.yml`
- 백엔드와 프론트엔드를 순차적으로 배포
- 헬스체크 포함

### 옵션 2: 수동 배포
- VPS에서 직접 스크립트 실행
- `hostinger-full-stack-deploy.sh` 사용

## 📊 현재 설정 정보

- **VPS IP**: `72.60.40.57`
- **백엔드 저장소**: `sherzod992/-GO`
- **백엔드 디렉토리**: `/var/www/ta-ja`
- **프론트엔드 디렉토리**: `/var/www/ta-go`
- **백엔드 포트**: `3000`
- **프론트엔드 포트**: `3011`
- **Nginx 설정**: `ta-ja`
