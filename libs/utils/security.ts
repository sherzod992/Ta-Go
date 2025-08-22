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

// 무한 새로고침 방지를 위한 유틸리티 함수들

/**
 * 안전한 페이지 새로고침 함수
 * 무한 루프를 방지하기 위해 현재 페이지 상태를 확인
 */
export const safeReload = (): void => {
  if (typeof window === 'undefined') return;
  
  // 무한 루프 감지 (순환 참조 방지를 위해 직접 호출)
  const now = Date.now();
  const reloadCount = parseInt(sessionStorage.getItem('reloadCount') || '0');
  const lastReloadTime = parseInt(sessionStorage.getItem('lastReloadTime') || '0');
  
  // 10초 이내에 3번 이상 새로고침이 발생하면 무한 루프로 간주
  if (now - lastReloadTime < 10000 && reloadCount >= 3) {
    console.error('무한 새로고침 루프 감지됨. 자동 복구를 시도합니다.');
    
    // 세션 스토리지 정리
    clearSessionStorage();
    
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 홈페이지로 강제 이동
    window.location.href = '/';
    return;
  }
  
  // 새로고침 카운터 업데이트
  sessionStorage.setItem('reloadCount', (reloadCount + 1).toString());
  sessionStorage.setItem('lastReloadTime', now.toString());
  
  // 마지막 새로고침 시간 확인
  const lastReload = sessionStorage.getItem('lastReload');
  
  // 5초 이내에 새로고침이 발생했으면 무시
  if (lastReload && (now - parseInt(lastReload)) < 5000) {
    console.warn('너무 빠른 새로고침 시도가 감지되어 무시됩니다.');
    return;
  }
  
  // 새로고침 시간 기록
  sessionStorage.setItem('lastReload', now.toString());
  
  // 안전한 새로고침 실행
  window.location.reload();
};

/**
 * 안전한 페이지 리다이렉트 함수
 * 무한 리다이렉트를 방지하기 위해 현재 경로 확인
 */
export const safeRedirect = (path: string): void => {
  if (typeof window === 'undefined') return;
  
  // 무한 루프 감지 (순환 참조 방지를 위해 직접 호출)
  const now = Date.now();
  const reloadCount = parseInt(sessionStorage.getItem('reloadCount') || '0');
  const lastReloadTime = parseInt(sessionStorage.getItem('lastReloadTime') || '0');
  
  // 10초 이내에 3번 이상 새로고침이 발생하면 무한 루프로 간주
  if (now - lastReloadTime < 10000 && reloadCount >= 3) {
    console.error('무한 새로고침 루프 감지됨. 자동 복구를 시도합니다.');
    
    // 세션 스토리지 정리
    clearSessionStorage();
    
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 홈페이지로 강제 이동
    window.location.href = '/';
    return;
  }
  
  // 새로고침 카운터 업데이트
  sessionStorage.setItem('reloadCount', (reloadCount + 1).toString());
  sessionStorage.setItem('lastReloadTime', now.toString());
  
  // 현재 경로와 동일한 경로로 리다이렉트하려면 무시
  if (window.location.pathname === path) {
    console.warn('동일한 경로로의 리다이렉트가 감지되어 무시됩니다.');
    return;
  }
  
  // 마지막 리다이렉트 시간 확인
  const lastRedirect = sessionStorage.getItem('lastRedirect');
  
  // 3초 이내에 같은 경로로 리다이렉트가 발생했으면 무시
  if (lastRedirect && (now - parseInt(lastRedirect)) < 3000) {
    console.warn('너무 빠른 리다이렉트 시도가 감지되어 무시됩니다.');
    return;
  }
  
  // 리다이렉트 시간 기록
  sessionStorage.setItem('lastRedirect', now.toString());
  
  // 안전한 리다이렉트 실행
  window.location.href = path;
};

/**
 * 로그아웃 시 안전한 페이지 이동 함수
 */
export const safeLogout = (): void => {
  if (typeof window === 'undefined') return;
  
  // 무한 루프 감지 (순환 참조 방지를 위해 직접 호출)
  const now = Date.now();
  const reloadCount = parseInt(sessionStorage.getItem('reloadCount') || '0');
  const lastReloadTime = parseInt(sessionStorage.getItem('lastReloadTime') || '0');
  
  // 10초 이내에 3번 이상 새로고침이 발생하면 무한 루프로 간주
  if (now - lastReloadTime < 10000 && reloadCount >= 3) {
    console.error('무한 새로고침 루프 감지됨. 자동 복구를 시도합니다.');
    
    // 세션 스토리지 정리
    clearSessionStorage();
    
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 홈페이지로 강제 이동
    window.location.href = '/';
    return;
  }
  
  // 새로고침 카운터 업데이트
  sessionStorage.setItem('reloadCount', (reloadCount + 1).toString());
  sessionStorage.setItem('lastReloadTime', now.toString());
  
  // 로그아웃 상태 기록
  sessionStorage.setItem('logoutTime', now.toString());
  
  // 현재 페이지가 홈페이지가 아니면 홈페이지로 이동
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  } else {
    // 홈페이지에 있을 때는 부드러운 새로고침
    window.location.reload();
  }
};

/**
 * 무한 루프 감지 및 방지 함수
 */
export const preventInfiniteLoop = (key: string, maxAttempts: number = 3): boolean => {
  if (typeof window === 'undefined') return false;
  
  const attempts = parseInt(sessionStorage.getItem(`loop_${key}`) || '0');
  
  if (attempts >= maxAttempts) {
    console.error(`무한 루프 감지: ${key}`);
    sessionStorage.removeItem(`loop_${key}`);
    return false;
  }
  
  sessionStorage.setItem(`loop_${key}`, (attempts + 1).toString());
  return true;
};

/**
 * 무한 루프 카운터 리셋 함수
 */
export const resetLoopCounter = (key: string): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(`loop_${key}`);
};

/**
 * 외부 URL에 대한 안전한 리다이렉트 함수
 * 외부 URL은 safeRedirect와 다른 로직을 사용
 */
export const safeExternalRedirect = (url: string): void => {
  if (typeof window === 'undefined') return;
  
  // 무한 루프 감지
  detectAndRecoverFromInfiniteLoop();
  
  // URL 유효성 검사
  try {
    new URL(url);
  } catch {
    console.error('유효하지 않은 URL:', url);
    return;
  }
  
  // 마지막 외부 리다이렉트 시간 확인
  const lastExternalRedirect = sessionStorage.getItem('lastExternalRedirect');
  const now = Date.now();
  
  // 3초 이내에 외부 리다이렉트가 발생했으면 무시
  if (lastExternalRedirect && (now - parseInt(lastExternalRedirect)) < 3000) {
    console.warn('너무 빠른 외부 리다이렉트 시도가 감지되어 무시됩니다.');
    return;
  }
  
  // 외부 리다이렉트 시간 기록
  sessionStorage.setItem('lastExternalRedirect', now.toString());
  
  // 안전한 외부 리다이렉트 실행
  window.location.href = url;
};

/**
 * 무한 루프 방지를 위한 추가적인 유틸리티 함수들
 */

/**
 * 컴포넌트 마운트 카운터
 * 컴포넌트가 너무 자주 마운트되는 것을 방지
 */
export const preventExcessiveMounts = (componentName: string, maxMounts: number = 10): boolean => {
  if (typeof window === 'undefined') return true;
  
  const mountKey = `mount_${componentName}`;
  const mounts = parseInt(sessionStorage.getItem(mountKey) || '0');
  
  if (mounts >= maxMounts) {
    console.error(`컴포넌트 ${componentName}이 너무 자주 마운트되고 있습니다.`);
    return false;
  }
  
  sessionStorage.setItem(mountKey, (mounts + 1).toString());
  return true;
};

/**
 * 마운트 카운터 리셋
 */
export const resetMountCounter = (componentName: string): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(`mount_${componentName}`);
};

/**
 * API 호출 제한 함수
 * 너무 자주 API를 호출하는 것을 방지
 */
export const preventExcessiveApiCalls = (apiName: string, maxCalls: number = 5, timeWindow: number = 10000): boolean => {
  if (typeof window === 'undefined') return true;
  
  const apiKey = `api_${apiName}`;
  const now = Date.now();
  const calls = JSON.parse(sessionStorage.getItem(apiKey) || '[]');
  
  // 시간 윈도우 이전의 호출 제거
  const recentCalls = calls.filter((timestamp: number) => now - timestamp < timeWindow);
  
  if (recentCalls.length >= maxCalls) {
    console.warn(`API ${apiName} 호출이 너무 빈번합니다.`);
    return false;
  }
  
  recentCalls.push(now);
  sessionStorage.setItem(apiKey, JSON.stringify(recentCalls));
  return true;
};

/**
 * 상태 업데이트 제한 함수
 * 너무 자주 상태를 업데이트하는 것을 방지
 */
export const preventExcessiveStateUpdates = (stateName: string, maxUpdates: number = 20, timeWindow: number = 5000): boolean => {
  if (typeof window === 'undefined') return true;
  
  const stateKey = `state_${stateName}`;
  const now = Date.now();
  const updates = JSON.parse(sessionStorage.getItem(stateKey) || '[]');
  
  // 시간 윈도우 이전의 업데이트 제거
  const recentUpdates = updates.filter((timestamp: number) => now - timestamp < timeWindow);
  
  if (recentUpdates.length >= maxUpdates) {
    console.warn(`상태 ${stateName} 업데이트가 너무 빈번합니다.`);
    return false;
  }
  
  recentUpdates.push(now);
  sessionStorage.setItem(stateKey, JSON.stringify(recentUpdates));
  return true;
};

/**
 * 무한 새로고침 방지를 위한 추가적인 유틸리티 함수들
 */

/**
 * 세션 스토리지 정리 함수
 * 무한 루프 방지를 위한 세션 스토리지 데이터 정리
 */
export const clearSessionStorage = (): void => {
  if (typeof window === 'undefined') return;
  
  // 무한 루프 관련 데이터만 정리
  const keysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (
      key.startsWith('loop_') || 
      key.startsWith('mount_') || 
      key.startsWith('api_') || 
      key.startsWith('state_') ||
      key === 'lastReload' ||
      key === 'lastRedirect' ||
      key === 'lastExternalRedirect'
    )) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => sessionStorage.removeItem(key));
  console.log('세션 스토리지 정리 완료');
};

/**
 * 무한 루프 감지 및 자동 복구 함수
 */
export const detectAndRecoverFromInfiniteLoop = (): void => {
  if (typeof window === 'undefined') return;
  
  const now = Date.now();
  const reloadCount = parseInt(sessionStorage.getItem('reloadCount') || '0');
  const lastReloadTime = parseInt(sessionStorage.getItem('lastReloadTime') || '0');
  
  // 5초 이내에 2번 이상 새로고침이 발생하면 무한 루프로 간주 (더 엄격하게)
  if (now - lastReloadTime < 5000 && reloadCount >= 2) {
    console.error('무한 새로고침 루프 감지됨. 자동 복구를 시도합니다.');
    
    // 세션 스토리지 정리
    clearSessionStorage();
    
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 홈페이지로 강제 이동 (순환 참조 방지를 위해 직접 호출)
    window.location.href = '/';
    return;
  }
  
  // 새로고침 카운터 업데이트
  sessionStorage.setItem('reloadCount', (reloadCount + 1).toString());
  sessionStorage.setItem('lastReloadTime', now.toString());
  
  // 20초 후 카운터 리셋 (더 짧게)
  setTimeout(() => {
    sessionStorage.removeItem('reloadCount');
    sessionStorage.removeItem('lastReloadTime');
  }, 20000);
};

/**
 * 페이지 로드 시 무한 루프 감지
 */
export const initializeInfiniteLoopDetection = (): void => {
  if (typeof window === 'undefined') return;
  
  // 페이지 로드 시 무한 루프 감지
  detectAndRecoverFromInfiniteLoop();
  
  // 개발 환경에서만 추가 디버깅 정보 출력
  if (process.env.NODE_ENV === 'development') {
    console.log('무한 루프 감지 시스템 초기화됨');
  }
};
