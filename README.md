# ta-Go 오토바이 거래 플랫폼

오토바이 거래를 위한 종합 플랫폼입니다.

## 🚀 빠른 시작

### 로컬 개발 환경

#### 1. 백엔드 실행
```bash
# 백엔드 디렉토리로 이동
cd backend-directory

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

#### 2. 프론트엔드 실행
```bash
# 의존성 설치
npm install

# 로컬 개발용 빌드 및 실행
npm run serve:local
```

또는 개발 모드로 실행:
```bash
npm run dev
```

### 프로덕션 배포

#### 자동 배포 (GitHub Actions)
1. `main` 브랜치에 푸시하면 자동으로 배포됩니다
2. GitHub Secrets 설정이 필요합니다 (자세한 내용은 `FULL_STACK_DEPLOY_GUIDE.md` 참조)

#### 수동 배포
```bash
# 프로덕션 빌드
npm run build

# 정적 사이트 서빙
npm run serve
```

## 📁 프로젝트 구조

```
ta-go/
├── pages/                 # Next.js 페이지
├── libs/                  # 공통 라이브러리
│   ├── components/        # React 컴포넌트
│   ├── hooks/            # 커스텀 훅
│   ├── types/            # TypeScript 타입 정의
│   └── utils/            # 유틸리티 함수
├── public/               # 정적 파일
├── scss/                 # 스타일 파일
└── next.config.js        # Next.js 설정
```

## 🔧 환경 설정

### 로컬 개발
- `next.config.local.js`: 로컬 개발용 설정 (localhost:3000 API)
- `npm run serve:local`: 로컬 개발용 빌드 및 실행

### 프로덕션
- `next.config.js`: 프로덕션 설정 (72.60.40.57:3000 API)
- 환경 변수로 API URL 설정 가능

## 📚 주요 기능

- 🏍️ 오토바이 매물 검색 및 등록
- 👥 사용자 인증 및 프로필 관리
- 💬 실시간 채팅
- 🌐 다국어 지원 (한국어, 영어, 일본어, 러시아어)
- 📱 반응형 디자인
- 🔍 고급 검색 필터

## 🛠️ 기술 스택

- **Frontend**: Next.js, React, TypeScript, Material-UI
- **Backend**: Node.js, GraphQL, Prisma
- **Database**: PostgreSQL
- **Deployment**: PM2, Nginx, GitHub Actions

## 📖 자세한 문서

- [전체 스택 배포 가이드](FULL_STACK_DEPLOY_GUIDE.md)
- [VPS 설정 가이드](HOSTINGER_VPS_DEPLOY_GUIDE.md)
- [OAuth 설정 가이드](OAUTH_SETUP_GUIDE.md)

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 ITC 라이선스 하에 배포됩니다.
