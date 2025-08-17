# OAuth 설정 가이드

이 문서는 프론트엔드에서 소셜 로그인을 구현하기 위한 OAuth 설정 방법을 설명합니다.

## 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# OAuth 설정
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Kakao OAuth
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id_here
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here

# Facebook OAuth
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Telegram Bot
NEXT_PUBLIC_TELEGRAM_BOT_ID=your_telegram_bot_id_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# 애플리케이션 설정
NEXT_PUBLIC_BASE_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
```

## 2. 각 소셜 플랫폼 OAuth 앱 등록

### Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보"로 이동
4. "사용자 인증 정보 만들기" > "OAuth 2.0 클라이언트 ID" 선택
5. 애플리케이션 유형: "웹 애플리케이션" 선택
6. 승인된 리디렉션 URI 추가:
   - `http://localhost:3000/auth/google/callback` (개발용)
   - `https://yourdomain.com/auth/google/callback` (프로덕션용)
7. 클라이언트 ID와 클라이언트 시크릿을 환경 변수에 설정

### Kakao OAuth 설정

1. [Kakao Developers](https://developers.kakao.com/)에 접속
2. 새 애플리케이션 생성
3. "플랫폼" > "Web" 플랫폼 등록
4. 사이트 도메인 추가:
   - `http://localhost:3000` (개발용)
   - `https://yourdomain.com` (프로덕션용)
5. "카카오 로그인" > "활성화" 설정
6. 리디렉션 URI 추가:
   - `http://localhost:3000/auth/kakao/callback` (개발용)
   - `https://yourdomain.com/auth/kakao/callback` (프로덕션용)
7. REST API 키를 환경 변수에 설정

### GitHub OAuth 설정

1. [GitHub Settings](https://github.com/settings/developers)에 접속
2. "OAuth Apps" > "New OAuth App" 클릭
3. 애플리케이션 정보 입력:
   - Application name: 애플리케이션 이름
   - Homepage URL: `http://localhost:3000` (개발용)
   - Authorization callback URL: `http://localhost:3000/auth/github/callback`
4. Client ID와 Client Secret을 환경 변수에 설정

### Facebook OAuth 설정

1. [Facebook Developers](https://developers.facebook.com/)에 접속
2. 새 앱 생성
3. "Facebook 로그인" 제품 추가
4. "설정" > "유효한 OAuth 리디렉션 URI" 추가:
   - `http://localhost:3000/auth/facebook/callback` (개발용)
   - `https://yourdomain.com/auth/facebook/callback` (프로덕션용)
5. App ID와 App Secret을 환경 변수에 설정

### Telegram Bot 설정

1. [@BotFather](https://t.me/botfather)와 대화
2. `/newbot` 명령어로 새 봇 생성
3. 봇 이름과 사용자명 설정
4. Bot Token을 받아서 환경 변수에 설정
5. Bot ID도 함께 설정

## 3. 프론트엔드 OAuth 설정 확인

프론트엔드에서 소셜 로그인을 구현할 때 다음 사항을 확인하세요:

- ✅ 올바른 클라이언트 ID 사용
- ✅ 올바른 리다이렉트 URI 설정
- ✅ 필요한 스코프(권한) 요청

## 4. 구현된 파일들

### 콜백 페이지
- `pages/auth/google/callback.tsx`
- `pages/auth/kakao/callback.tsx`
- `pages/auth/github/callback.tsx`
- `pages/auth/facebook/callback.tsx`

### API 라우트
- `pages/api/auth/google.ts`
- `pages/api/auth/kakao.ts`
- `pages/api/auth/github.ts`
- `pages/api/auth/facebook.ts`

### 컴포넌트
- `libs/components/auth/SocialLoginButtons.tsx`

## 5. 테스트 방법

환경 변수를 설정한 후 GraphQL Playground에서 테스트할 수 있습니다:

```graphql
mutation SocialLogin {
  socialLogin(input: {
    authType: KAKAO
    socialToken: "실제_카카오_액세스_토큰"
    socialProvider: "KAKAO"
    memberNick: "테스트사용자"
    memberFullName: "테스트 사용자"
    memberImage: "https://profile.image.url"
    memberEmail: "test@example.com"
  }) {
    _id
    memberNick
    memberFullName
    memberImage
    memberEmail
    memberAuthType
    accessToken
  }
}
```

## 6. 주요 확인 사항

- ✅ 환경 변수 파일 (.env.local) 생성
- ✅ 각 소셜 플랫폼에서 OAuth 앱 등록
- ✅ 올바른 클라이언트 ID와 시크릿 설정
- ✅ 리다이렉트 URI 설정
- ✅ 서버 재시작

## 7. 문제 해결

### 일반적인 문제들

1. **CORS 오류**: 리디렉트 URI가 정확히 설정되었는지 확인
2. **인증 실패**: 클라이언트 ID와 시크릿이 올바른지 확인
3. **토큰 교환 실패**: 백엔드 URL이 올바른지 확인

### 디버깅

브라우저 개발자 도구의 Network 탭에서 OAuth 요청을 확인하세요:
- Authorization code 요청
- Token 교환 요청
- 사용자 정보 요청

## 8. 보안 고려사항

- 클라이언트 시크릿은 서버 사이드에서만 사용
- HTTPS 사용 (프로덕션)
- 적절한 스코프만 요청
- 토큰 만료 시간 설정
- CSRF 보호 구현
