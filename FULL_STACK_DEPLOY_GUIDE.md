# 전체 스택 배포 가이드 (백엔드 + 프론트엔드)

## 📋 사전 준비사항

### 1. VPS 정보
- **VPS IP**: `72.60.40.57`
- **SSH 접속 정보**: 사용자명, 비밀번호 또는 SSH 키
- **도메인**: 선택사항

### 2. GitHub 저장소
- **프론트엔드 저장소**: `your-username/ta-go`
- **백엔드 저장소**: `your-username/ta-go-backend`
- **GitHub Actions 권한**

### 3. 데이터베이스
- **데이터베이스 연결 정보**
- **JWT 시크릿 키**

## 🚀 배포 단계

### 1단계: VPS 초기 설정

```bash
# SSH로 VPS에 접속
ssh username@72.60.40.57

# 전체 스택 초기 설정 스크립트 실행
chmod +x hostinger-full-stack-setup.sh
./hostinger-full-stack-setup.sh
```

### 2단계: 백엔드 저장소 클론

```bash
cd /var/www/ta-go-backend
git clone https://github.com/your-username/ta-go-backend.git .
```

### 3단계: 프론트엔드 저장소 클론

```bash
cd /var/www/ta-go
git clone https://github.com/your-username/ta-go.git .
```

### 4단계: 백엔드 환경 변수 설정

```bash
cd /var/www/ta-go-backend
cp .env.example .env
nano .env
```

백엔드 `.env` 파일 예시:
```env
# Database
DATABASE_URL=your-database-connection-string

# JWT
JWT_SECRET=your-jwt-secret-key

# Server
PORT=3000
NODE_ENV=production

# OAuth (선택사항)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
```

### 5단계: 프론트엔드 환경 변수 설정

```bash
cd /var/www/ta-go
chmod +x hostinger-env-setup.sh
./hostinger-env-setup.sh
```

### 6단계: Nginx 설정

```bash
chmod +x hostinger-nginx-setup.sh
./hostinger-nginx-setup.sh
```

### 7단계: GitHub Secrets 설정

GitHub 저장소 → Settings → Secrets and variables → Actions에서 설정:

#### 필수 Secrets:
- `VPS_HOST`: `72.60.40.57`
- `VPS_USERNAME`: VPS 사용자명
- `VPS_SSH_KEY`: SSH 개인키
- `BACKEND_REPOSITORY`: `your-username/ta-go-backend`
- `DATABASE_URL`: 데이터베이스 연결 문자열
- `JWT_SECRET`: JWT 암호화 키
- `NEXT_PUBLIC_API_URL`: `http://72.60.40.57:3000`
- `NEXT_PUBLIC_API_GRAPHQL_URL`: `http://72.60.40.57:3000/graphql`
- `NEXT_PUBLIC_API_WS`: `ws://72.60.40.57:3000`

### 8단계: 첫 번째 배포

```bash
# 전체 스택 배포
chmod +x hostinger-full-stack-deploy.sh
./hostinger-full-stack-deploy.sh
```

### 9단계: GitHub Actions 자동 배포 테스트

```bash
# 로컬에서 main 브랜치에 푸시
git add .
git commit -m "Initial full stack deployment setup"
git push origin main
```

## 🔄 자동 배포 워크플로우

### GitHub Actions 설정

`.github/workflows/deploy-full-stack.yml` 파일이 자동으로 생성됩니다:

```yaml
name: Deploy Full Stack (Backend + Frontend)

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    name: Deploy Backend
    
    steps:
    - name: Checkout Backend Repository
      uses: actions/checkout@v3
      with:
        repository: ${{ secrets.BACKEND_REPOSITORY }}
        token: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install Backend Dependencies
      run: npm ci
    
    - name: Build Backend
      run: npm run build
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        JWT_SECRET: ${{ secrets.JWT_SECRET }}
    
    - name: Deploy Backend to VPS
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USERNAME }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /var/www/ta-go-backend
          git pull origin main
          npm ci
          npm run build
          pm2 restart ta-go-backend
          echo "✅ 백엔드 배포 완료!"

  deploy-frontend:
    runs-on: ubuntu-latest
    name: Deploy Frontend
    needs: deploy-backend
    
    steps:
    - name: Checkout Frontend Repository
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install Frontend Dependencies
      run: npm ci
    
    - name: Build Frontend
      run: npm run build
      env:
        NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
        NEXT_PUBLIC_API_GRAPHQL_URL: ${{ secrets.NEXT_PUBLIC_API_GRAPHQL_URL }}
        NEXT_PUBLIC_API_WS: ${{ secrets.NEXT_PUBLIC_API_WS }}
    
    - name: Deploy Frontend to VPS
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USERNAME }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /var/www/ta-go
          git pull origin main
          npm ci
          npm run build
          pm2 restart ta-go
          echo "✅ 프론트엔드 배포 완료!"

  health-check:
    runs-on: ubuntu-latest
    name: Health Check
    needs: [deploy-backend, deploy-frontend]
    
    steps:
    - name: Check Backend Health
      run: |
        sleep 30
        curl -f http://${{ secrets.VPS_HOST }}:3000/health || exit 1
        echo "✅ 백엔드 헬스체크 통과"
    
    - name: Check Frontend Health
      run: |
        sleep 10
        curl -f http://${{ secrets.VPS_HOST }} || exit 1
        echo "✅ 프론트엔드 헬스체크 통과"
    
    - name: Notify Success
      run: |
        echo "🎉 전체 스택 배포 완료!"
        echo "🌐 프론트엔드: http://${{ secrets.VPS_HOST }}"
        echo "🔧 백엔드 API: http://${{ secrets.VPS_HOST }}:3000"
```

## 🔧 관리 명령어

### PM2 관리
```bash
# 모든 애플리케이션 상태 확인
pm2 status

# 백엔드만 재시작
pm2 restart ta-go-backend

# 프론트엔드만 재시작
pm2 restart ta-go

# 모든 애플리케이션 재시작
pm2 restart all

# 로그 확인
pm2 logs ta-go-backend
pm2 logs ta-go

# 실시간 모니터링
pm2 monit
```

### Nginx 관리
```bash
# Nginx 상태 확인
sudo systemctl status nginx

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 설정 테스트
sudo nginx -t
```

### 로그 확인
```bash
# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 애플리케이션 로그
pm2 logs ta-go-backend
pm2 logs ta-go
```

## 🔄 업데이트 배포

### 자동 배포 (권장)
```bash
# 로컬에서 코드 수정 후
git add .
git commit -m "Update: 기능 설명"
git push origin main
# GitHub Actions가 자동으로 배포
```

### 수동 배포
```bash
cd /var/www/ta-go
./hostinger-full-stack-deploy.sh
```

## 🌿 브랜치 전략

### 권장 브랜치 구조:
```
main (또는 master)     ← 프로덕션 배포용
├── develop            ← 개발 통합용
├── feature/기능명      ← 새 기능 개발용
├── hotfix/버그명       ← 긴급 수정용
└── release/버전명      ← 릴리스 준비용
```

### 개발 워크플로우:
```bash
# 1. feature 브랜치 생성
git checkout -b feature/new-feature

# 2. 개발 완료 후 develop에 머지
git checkout develop
git merge feature/new-feature

# 3. develop을 main에 머지 (배포)
git checkout main
git merge develop
git push origin main
```

## 🛠️ 문제 해결

### 포트 충돌 시
```bash
# 포트 사용 확인
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3011

# 프로세스 종료
sudo kill -9 [PID]
```

### 메모리 부족 시
```bash
# 메모리 사용량 확인
free -h

# 스왑 메모리 생성
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 데이터베이스 연결 문제
```bash
# 데이터베이스 연결 테스트
cd /var/www/ta-go-backend
npm run db:test

# 환경 변수 확인
cat .env | grep DATABASE_URL
```

### GitHub Actions 실패 시
```bash
# VPS에서 수동으로 배포
cd /var/www/ta-go
./hostinger-full-stack-deploy.sh
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. GitHub Actions 로그 확인
2. VPS 로그 확인
3. 방화벽 설정 확인
4. 포트 상태 확인
5. 환경 변수 설정 확인
6. 데이터베이스 연결 확인

## ✅ 체크리스트

- [ ] VPS 초기 설정 완료
- [ ] 백엔드 저장소 클론 완료
- [ ] 프론트엔드 저장소 클론 완료
- [ ] 백엔드 환경 변수 설정 완료
- [ ] 프론트엔드 환경 변수 설정 완료
- [ ] Nginx 설정 완료
- [ ] GitHub Secrets 설정 완료
- [ ] 첫 번째 배포 완료
- [ ] GitHub Actions 자동 배포 테스트 완료
- [ ] SSL 인증서 설치 (선택사항)
- [ ] 도메인 연결 확인
- [ ] 데이터베이스 연결 확인
