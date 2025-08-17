import crypto from 'crypto';

// CSRF 토큰 생성
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF 토큰 검증
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken;
};

// 상태 토큰 생성 (OAuth state parameter)
export const generateStateToken = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

// PKCE 코드 챌린지 생성
export const generatePKCECodeChallenge = (): { codeVerifier: string; codeChallenge: string } => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  
  return { codeVerifier, codeChallenge };
};

// 토큰 검증 (JWT 형식 확인)
export const validateTokenFormat = (token: string): boolean => {
  // JWT 토큰은 3개의 부분으로 구성되어야 함
  const parts = token.split('.');
  return parts.length === 3;
};

// 이메일 형식 검증
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 전화번호 형식 검증
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9-+\s()]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
};

// 입력값 sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // HTML 태그 제거
    .replace(/javascript:/gi, '') // JavaScript 프로토콜 제거
    .trim();
};

// Rate limiting을 위한 키 생성
export const generateRateLimitKey = (ip: string, action: string): string => {
  return `${ip}:${action}:${Math.floor(Date.now() / (60 * 1000))}`; // 1분 단위
};
