import { useState, useEffect } from 'react';

// 브레이크포인트 정의
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// 반응형 훅
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('xs');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });

      // 현재 브레이크포인트 결정
      if (width >= breakpoints.xxl) {
        setCurrentBreakpoint('xxl');
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint('sm');
      } else {
        setCurrentBreakpoint('xs');
      }
    };

    // 초기 설정
    handleResize();

    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);
    
    // 클린업
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 브레이크포인트 체크 함수들
  const isXs = currentBreakpoint === 'xs';
  const isSm = currentBreakpoint === 'sm';
  const isMd = currentBreakpoint === 'md';
  const isLg = currentBreakpoint === 'lg';
  const isXl = currentBreakpoint === 'xl';
  const isXxl = currentBreakpoint === 'xxl';

  // 최소 브레이크포인트 체크
  const isMinSm = windowSize.width >= breakpoints.sm;
  const isMinMd = windowSize.width >= breakpoints.md;
  const isMinLg = windowSize.width >= breakpoints.lg;
  const isMinXl = windowSize.width >= breakpoints.xl;
  const isMinXxl = windowSize.width >= breakpoints.xxl;

  // 최대 브레이크포인트 체크
  const isMaxSm = windowSize.width < breakpoints.md;
  const isMaxMd = windowSize.width < breakpoints.lg;
  const isMaxLg = windowSize.width < breakpoints.xl;
  const isMaxXl = windowSize.width < breakpoints.xxl;

  // 디바이스 타입 체크
  const isMobile = windowSize.width < breakpoints.md;
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg;
  const isDesktop = windowSize.width >= breakpoints.lg;

  // 방향 체크
  const isPortrait = windowSize.height > windowSize.width;
  const isLandscape = windowSize.width > windowSize.height;

  return {
    windowSize,
    currentBreakpoint,
    breakpoints,
    
    // 정확한 브레이크포인트
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,
    
    // 최소 브레이크포인트
    isMinSm,
    isMinMd,
    isMinLg,
    isMinXl,
    isMinXxl,
    
    // 최대 브레이크포인트
    isMaxSm,
    isMaxMd,
    isMaxLg,
    isMaxXl,
    
    // 디바이스 타입
    isMobile,
    isTablet,
    isDesktop,
    
    // 방향
    isPortrait,
    isLandscape,
  };
};

// 특정 브레이크포인트에서만 실행되는 훅
export const useBreakpoint = (breakpoint: Breakpoint) => {
  const { currentBreakpoint } = useResponsive();
  return currentBreakpoint === breakpoint;
};

// 최소 브레이크포인트 체크 훅
export const useMinBreakpoint = (breakpoint: Breakpoint) => {
  const { windowSize } = useResponsive();
  return windowSize.width >= breakpoints[breakpoint];
};

// 최대 브레이크포인트 체크 훅
export const useMaxBreakpoint = (breakpoint: Breakpoint) => {
  const { windowSize } = useResponsive();
  return windowSize.width < breakpoints[breakpoint];
};

// 디바이스 타입 체크 훅
export const useDeviceType = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  if (isDesktop) return 'desktop';
  
  return 'unknown';
};

// 화면 방향 체크 훅
export const useOrientation = () => {
  const { isPortrait, isLandscape } = useResponsive();
  
  if (isPortrait) return 'portrait';
  if (isLandscape) return 'landscape';
  
  return 'unknown';
};
