import { useEffect, useState } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isDesktop: boolean;
  device: 'mobile' | 'desktop';
}

const useDeviceDetect = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isDesktop: true,
    device: 'desktop'
  });

  useEffect(() => {
    // 서버 사이드에서는 기본값 사용
    if (typeof window === 'undefined') {
      return;
    }

    // 무한 루프 방지를 위한 디바운싱
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const userAgent = navigator.userAgent;
        const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        // 화면 크기 기반 모바일 감지 (768px 이하를 모바일로 간주)
        const isMobileScreen = window.innerWidth <= 768;
        
        // User Agent 또는 화면 크기 중 하나라도 모바일이면 모바일로 판단
        const isMobile = isMobileUserAgent || isMobileScreen;
        
        setDeviceInfo({
          isMobile,
          isDesktop: !isMobile,
          device: isMobile ? 'mobile' : 'desktop'
        });
      }, 100); // 100ms 디바운싱
    };

    // 초기 설정
    handleResize();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', handleResize);

    // 클린업
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return deviceInfo;
};

export default useDeviceDetect;
