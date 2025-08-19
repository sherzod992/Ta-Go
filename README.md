# TA-GO 프로젝트

## 🚀 빠른 시작

### 🌐 배포된 사이트
- **프론트엔드**: [http://72.60.40.57](http://72.60.40.57)
- **백엔드 API**: [http://72.60.40.57:3000](http://72.60.40.57:3000)
- **GraphQL**: [http://72.60.40.57:3000/graphql](http://72.60.40.57:3000/graphql)

### 📋 배포 가이드
- [📖 전체 스택 배포 가이드](FULL_STACK_DEPLOY_GUIDE.md)
- [🔧 GitHub Secrets 설정 가이드](GITHUB_SECRETS_SETUP.md)
- [🌐 호스팅어 VPS 배포 가이드](HOSTINGER_VPS_DEPLOY_GUIDE.md)

## 🏗️ 프로젝트 구조

```
ta-go/
├── .github/workflows/          # GitHub Actions 워크플로우
│   ├── deploy.yml             # VPS 배포 워크플로우
│   └── deploy-vps.yml         # 프론트엔드 전용 배포
├── libs/                      # 공통 라이브러리
├── pages/                     # Next.js 페이지
├── public/                    # 정적 파일
├── scss/                      # 스타일 파일
├── hostinger-*.sh            # 배포 스크립트들
└── README.md                 # 프로젝트 문서
```

## 🚀 배포 정보

### VPS 정보
- **IP 주소**: `72.60.40.57`
- **서버 호스트명**: `srv963199.hstgr.cloud`
- **운영체제**: Ubuntu
- **상태**: Running

### 배포 구성
- **백엔드**: `/var/www/ta-ja` (포트 3000)
- **프론트엔드**: `/var/www/ta-go` (포트 3011)
- **Nginx**: 리버스 프록시 (포트 80/443)

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn
- Git

### 로컬 개발 서버 실행
```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 브라우저에서 확인
# http://localhost:3011
```

## 📚 문서

### 배포 관련
- [📖 전체 스택 배포 가이드](FULL_STACK_DEPLOY_GUIDE.md)
- [🔧 GitHub Secrets 설정 가이드](GITHUB_SECRETS_SETUP.md)
- [🌐 호스팅어 VPS 배포 가이드](HOSTINGER_VPS_DEPLOY_GUIDE.md)
- [🔐 OAuth 설정 가이드](OAUTH_SETUP_GUIDE.md)

### 스크립트 파일
- [🚀 VPS 초기 설정](hostinger-vps-setup.sh)
- [🌐 Nginx 설정](hostinger-nginx-setup.sh)
- [🔧 환경 변수 설정](hostinger-env-setup.sh)
- [📦 전체 스택 배포](hostinger-full-stack-deploy.sh)
- [🐳 Docker 배포](hostinger-docker-deploy.sh)

## 🔄 자동 배포

### GitHub Actions 워크플로우
- **워크플로우 파일**: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
- **트리거**: main 브랜치에 푸시 시 자동 배포
- **순서**: 백엔드 → 프론트엔드 → 헬스체크

### 수동 배포
```bash
# VPS에 SSH 접속
ssh username@72.60.40.57

# 전체 스택 배포
chmod +x hostinger-full-stack-deploy.sh
./hostinger-full-stack-deploy.sh
```

## 🛠️ 관리 명령어

### PM2 관리
```bash
# 상태 확인
pm2 status

# 로그 확인
pm2 logs ta-ja-backend
pm2 logs ta-go

# 재시작
pm2 restart all
```

### Nginx 관리
```bash
# 상태 확인
sudo systemctl status nginx

# 재시작
sudo systemctl restart nginx
```

## 📞 지원

### 문제 해결
- [GitHub Actions 로그](https://github.com/your-username/ta-go/actions)
- [VPS 로그 확인](#로그-확인)
- [헬스체크](#헬스체크)

### 연락처
- **GitHub Issues**: [이슈 등록](https://github.com/your-username/ta-go/issues)
- **VPS 접속**: `ssh username@72.60.40.57`

## 🔗 유용한 링크

### 배포된 서비스
- 🌐 [프론트엔드](http://72.60.40.57)
- 🔧 [백엔드 API](http://72.60.40.57:3000)
- 📊 [GraphQL Playground](http://72.60.40.57:3000/graphql)
- 🏥 [백엔드 헬스체크](http://72.60.40.57:3000/health)

### 개발 도구
- 📚 [Next.js 문서](https://nextjs.org/docs)
- 🎨 [Material-UI 문서](https://mui.com/)
- 🔍 [Apollo GraphQL](https://www.apollographql.com/docs/)
- 🚀 [PM2 문서](https://pm2.keymetrics.io/docs/)

### 호스팅 서비스
- 🌐 [호스팅어 VPS](https://www.hostinger.com/vps-hosting)
- 🔐 [GitHub](https://github.com)
- 🐳 [Docker Hub](https://hub.docker.com)

## 📊 프로젝트 상태

- ✅ **VPS 설정**: 완료
- ✅ **백엔드 배포**: 완료
- ✅ **프론트엔드 배포**: 완료
- ✅ **Nginx 설정**: 완료
- ✅ **GitHub Actions**: 완료
- ✅ **자동 배포**: 완료
- ✅ **SSL 인증서**: 선택사항
- ✅ **도메인 연결**: 선택사항

## 🎯 다음 단계

1. **GitHub Secrets 설정** - [가이드 보기](GITHUB_SECRETS_SETUP.md)
2. **첫 번째 배포** - [가이드 보기](FULL_STACK_DEPLOY_GUIDE.md)
3. **도메인 연결** (선택사항)
4. **SSL 인증서 설치** (선택사항)

---

**마지막 업데이트**: 2024년 12월
**버전**: 2.2.0
