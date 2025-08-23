# 모바일 UI 수정 가이드

## 📱 수정된 모바일 UI 내용

### 1. Top 영역 수정
- **기존**: 전체 메뉴가 보이는 구조
- **수정**: 한 줄에 4가지 요소만 정렬
  - 햄버거 메뉴 버튼
  - 로고
  - 언어 선택
  - 로그인/사용자 아바타

### 2. 매물 검색 영역 수정
- **매물 타입**: 가로 레이아웃 유지, 한 화면에 4개만 보이고 나머지는 가로 스크롤
- **필터 배치**: 브랜드/키워드/위치/컨디션 → 매물 타입 아래에 가로 정렬 (2x2 그리드)
- **가격 범위**: 매물 타입 아래로 이동
- **버튼 구조**: 바이크 보기 + 모두 지우기 버튼 → 한 줄에 나란히 배치

### 3. Footer 영역
- 모든 페이지에서 동일하게 보이도록 유지

## 🚀 배포 문제 해결 방법

### 문제 상황
- **로컬 (localhost:3011)**: 수정한 UI가 정상 작동
- **배포 서버 (http://72.60.40.57:3011/)**: 수정한 UI가 반영되지 않음

### 원인 분석
1. **최신 빌드 미배포**: 서버가 옛날 빌드 파일을 사용
2. **캐시 문제**: 브라우저 캐시, 서버 캐시(Nginx) 남아있음
3. **환경 차이**: 로컬과 배포 서버의 설정 차이

### 해결 방법

#### 1. 빠른 배포 (권장)
```bash
./quick-deploy.sh
```

#### 2. 강제 새로고침 (캐시 문제 시)
```bash
./force-refresh.sh
```

#### 3. 수동 해결 방법

##### A. Docker 컨테이너 재시작
```bash
# 기존 컨테이너 중지
docker-compose down

# 새로 빌드
docker-compose build --no-cache

# 컨테이너 시작
docker-compose up -d
```

##### B. 브라우저 캐시 클리어
- **Chrome/Edge**: `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac)
- **Firefox**: `Ctrl + F5` (Windows) / `Cmd + Shift + R` (Mac)
- **Safari**: `Cmd + Option + R`

##### C. 개발자 도구에서 캐시 비활성화
1. F12 → Network 탭
2. "Disable cache" 체크박스 활성화
3. 페이지 새로고침

## 📁 수정된 파일 목록

### 컴포넌트 파일
- `libs/components/top/TopMobile.tsx` - Top 영역 레이아웃 수정
- `libs/components/buy/BuyPageMobile.tsx` - 매물 검색 영역 수정

### 스타일 파일
- `scss/mobile/top/top.scss` - Top 영역 스타일
- `scss/mobile/buy/buy.scss` - 매물 검색 영역 스타일

### 설정 파일
- `nginx/nginx.conf` - Nginx 캐시 설정 수정

### 배포 스크립트
- `quick-deploy.sh` - 빠른 배포 스크립트
- `force-refresh.sh` - 강제 새로고침 스크립트

## 🔧 추가 설정

### Nginx 캐시 설정
- 정적 파일 캐싱: 1년 → 1시간으로 변경
- HTML 파일: 캐시하지 않음
- 캐시 무효화 헤더 추가

### Docker 빌드 최적화
- `--no-cache` 옵션으로 완전 새 빌드
- 빌드 캐시 클리어
- 이미지 완전 재생성

## 🐛 문제 해결 체크리스트

### 배포 후 확인사항
- [ ] 브라우저에서 강제 새로고침 (Ctrl+F5)
- [ ] 개발자 도구에서 캐시 비활성화
- [ ] 다른 브라우저에서 테스트
- [ ] 모바일 기기에서 테스트
- [ ] 시크릿 모드에서 테스트

### 로그 확인
```bash
# 컨테이너 상태 확인
docker-compose ps

# 프론트엔드 로그 확인
docker-compose logs ta-go-frontend

# Nginx 로그 확인
docker-compose logs nginx
```

### 환경 변수 확인
```bash
# 컨테이너 환경 변수 확인
docker-compose exec ta-go-frontend env | grep NEXT_PUBLIC
```

## 📞 추가 지원

문제가 지속되는 경우:
1. 로그 파일 확인
2. 네트워크 연결 상태 확인
3. 서버 리소스 사용량 확인
4. DNS 캐시 클리어

---

**마지막 업데이트**: 2024년 12월
**버전**: 1.0.0
