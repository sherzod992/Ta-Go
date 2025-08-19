# 호스팅어 VPS 배포 가이드 (GitHub 연동)

## 📋 사전 준비사항

### 1. 호스팅어 VPS 정보
- VPS IP 주소: `72.60.40.57`
- SSH 접속 정보 (사용자명, 비밀번호 또는 SSH 키)
- 도메인 (선택사항)

### 2. GitHub 저장소
- GitHub 저장소 URL
- GitHub Actions 권한
- SSH 키 (선택사항)

## 🚀 배포 단계

### 1단계: VPS 초기 설정

```bash
# SSH로 VPS에 접속
ssh username@72.60.40.57

# 초기 설정 스크립트 실행
chmod +x hostinger-vps-setup.sh
./hostinger-vps-setup.sh
```

### 2단계: GitHub 저장소 클론

```bash
cd /var/www/ta-go
git clone https://github.com/your-username/ta-go.git .
```

### 3단계: 환경 변수 설정

```bash
# 환경 변수 자동 설정
chmod +x hostinger-env-setup.sh
./hostinger-env-setup.sh

# 수동으로 추가 설정 (필요한 경우)
nano .env
```

### 4단계: Nginx 설정

```bash
# Nginx 설정
chmod +x hostinger-nginx-setup.sh
./hostinger-nginx-setup.sh
```

### 5단계: GitHub Secrets 설정

GitHub 저장소 → Settings → Secrets and variables → Actions에서 다음 설정:

#### 필수 Secrets:
- `VPS_HOST`: `72.60.40.57`
- `VPS_USERNAME`: VPS 사용자명
- `VPS_SSH_KEY`: SSH 개인키 (또는 `VPS_PASSWORD`)
- `NEXT_PUBLIC_API_URL`: `http://72.60.40.57:3000`
- `NEXT_PUBLIC_API_GRAPHQL_URL`: `http://72.60.40.57:3000/graphql`
- `NEXT_PUBLIC_API_WS`: `ws://72.60.40.57:3000`

### 6단계: 첫 번째 배포

```bash
# 수동 배포 (첫 번째만)
chmod +x hostinger-deploy.sh
./hostinger-deploy.sh
```

### 7단계: GitHub Actions 자동 배포 테스트

```bash
# 로컬에서 main 브랜치에 푸시
git add .
git commit -m "Initial deployment setup"
git push origin main
```

## 🔄 자동 배포 워크플로우

### GitHub Actions 설정

`.github/workflows/deploy-vps.yml` 파일이 자동으로 생성됩니다:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
        NEXT_PUBLIC_API_GRAPHQL_URL: ${{ secrets.NEXT_PUBLIC_API_GRAPHQL_URL }}
        NEXT_PUBLIC_API_WS: ${{ secrets.NEXT_PUBLIC_API_WS }}
    
    - name: Deploy to VPS
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
          echo "✅ 배포 완료!"
```

## 🔧 관리 명령어

### PM2 관리
```bash
# 애플리케이션 상태 확인
pm2 status

# 애플리케이션 재시작
pm2 restart ta-go

# 로그 확인
pm2 logs ta-go

# 애플리케이션 중지
pm2 stop ta-go

# 애플리케이션 시작
pm2 start ta-go
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
./hostinger-deploy.sh
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

### 포트 3000이 사용 중인 경우
```bash
# 포트 사용 확인
sudo netstat -tlnp | grep :3000

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

### SSL 인증서 갱신
```bash
sudo certbot renew --dry-run
```

### GitHub Actions 실패 시
```bash
# VPS에서 수동으로 배포
cd /var/www/ta-go
git pull origin main
npm ci
npm run build
pm2 restart ta-go
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. GitHub Actions 로그 확인
2. VPS 로그 확인
3. 방화벽 설정 확인
4. 포트 상태 확인
5. 환경 변수 설정 확인

## ✅ 체크리스트

- [ ] VPS 초기 설정 완료
- [ ] GitHub 저장소 클론 완료
- [ ] 환경 변수 설정 완료
- [ ] Nginx 설정 완료
- [ ] GitHub Secrets 설정 완료
- [ ] 첫 번째 배포 완료
- [ ] GitHub Actions 자동 배포 테스트 완료
- [ ] SSL 인증서 설치 (선택사항)
- [ ] 도메인 연결 확인
