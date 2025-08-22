# 🚀 빠른 접근 가이드

## 🌐 바로가기 링크

### 📱 배포된 서비스
| 서비스 | 링크 | 설명 |
|--------|------|------|
| 🏠 **프론트엔드** | [http://72.60.40.57](http://72.60.40.57) | 메인 웹사이트 |
| 🔧 **백엔드 API** | [http://72.60.40.57:3000](http://72.60.40.57:3000) | API 서버 |
| 📊 **GraphQL** | [http://72.60.40.57:3000/graphql](http://72.60.40.57:3000/graphql) | GraphQL Playground |
| 🏥 **헬스체크** | [http://72.60.40.57:3000/health](http://72.60.40.57:3000/health) | 서버 상태 확인 |

### 📚 문서 가이드
| 문서 | 링크 | 설명 |
|------|------|------|
| 📖 **전체 배포 가이드** | [FULL_STACK_DEPLOY_GUIDE.md](FULL_STACK_DEPLOY_GUIDE.md) | 완전한 배포 과정 |
| 🔧 **GitHub Secrets** | [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md) | GitHub 설정 |
| 🌐 **VPS 배포 가이드** | [HOSTINGER_VPS_DEPLOY_GUIDE.md](HOSTINGER_VPS_DEPLOY_GUIDE.md) | 호스팅어 VPS 설정 |
| 🔐 **OAuth 설정** | [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md) | 소셜 로그인 설정 |

### 🛠️ 스크립트 파일
| 스크립트 | 링크 | 설명 |
|----------|------|------|
| 🚀 **VPS 초기 설정** | [hostinger-vps-setup.sh](hostinger-vps-setup.sh) | 서버 초기 설정 |
| 🌐 **Nginx 설정** | [hostinger-nginx-setup.sh](hostinger-nginx-setup.sh) | 웹서버 설정 |
| 🔧 **환경 변수** | [hostinger-env-setup.sh](hostinger-env-setup.sh) | 환경 변수 설정 |
| 📦 **전체 배포** | [hostinger-full-stack-deploy.sh](hostinger-full-stack-deploy.sh) | 전체 스택 배포 |
| 🐳 **Docker 배포** | [hostinger-docker-deploy.sh](hostinger-docker-deploy.sh) | Docker 배포 |

## ⚡ 빠른 명령어

### VPS 접속
```bash
ssh username@72.60.40.57
```

### 배포 실행
```bash
# 전체 스택 배포
./hostinger-full-stack-deploy.sh

# 또는 개별 배포
cd /var/www/ta-ja && git pull && npm ci && npm run build && pm2 restart ta-ja-backend
cd /var/www/ta-go && git pull && npm ci && npm run build && pm2 restart ta-go
```

### 상태 확인
```bash
# PM2 상태
pm2 status

# Nginx 상태
sudo systemctl status nginx

# 포트 확인
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3011
```

### 로그 확인
```bash
# 백엔드 로그
pm2 logs ta-ja-backend

# 프론트엔드 로그
pm2 logs ta-go

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔄 자동 배포

### GitHub Actions
- **워크플로우**: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
- **트리거**: main 브랜치 푸시 시 자동 배포
- **순서**: 백엔드 → 프론트엔드 → 헬스체크

### 수동 배포
```bash
# 로컬에서
git add .
git commit -m "Update: 변경사항"
git push origin main
```

## 🚨 문제 해결

### 서비스가 안 열릴 때
1. **VPS 상태 확인**: [http://72.60.40.57:3000/health](http://72.60.40.57:3000/health)
2. **PM2 상태 확인**: `pm2 status`
3. **Nginx 상태 확인**: `sudo systemctl status nginx`
4. **포트 확인**: `sudo netstat -tlnp | grep :3000`

### 배포 실패 시
1. **GitHub Actions 로그 확인**
2. **VPS에서 수동 배포**: `./hostinger-full-stack-deploy.sh`
3. **환경 변수 확인**: `cat .env`

## 📊 현재 상태

| 항목 | 상태 | 확인 방법 |
|------|------|-----------|
| 🖥️ **VPS** | ✅ 실행 중 | [http://72.60.40.57](http://72.60.40.57) |
| 🔧 **백엔드** | ✅ 배포됨 | [http://72.60.40.57:3000](http://72.60.40.57:3000) |
| 🌐 **프론트엔드** | ✅ 배포됨 | [http://72.60.40.57](http://72.60.40.57) |
| 🌐 **Nginx** | ✅ 설정됨 | `sudo systemctl status nginx` |
| 🔄 **자동 배포** | ✅ 설정됨 | [GitHub Actions](https://github.com/your-username/ta-go/actions) |

## 🎯 다음 단계

1. **GitHub Secrets 설정** → [가이드](GITHUB_SECRETS_SETUP.md)
2. **첫 번째 배포** → [가이드](FULL_STACK_DEPLOY_GUIDE.md)
3. **도메인 연결** (선택사항)
4. **SSL 인증서 설치** (선택사항)

---

**💡 팁**: 이 파일을 북마크에 추가하면 언제든지 빠르게 접근할 수 있습니다!
