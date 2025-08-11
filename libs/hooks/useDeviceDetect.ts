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
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    setDeviceInfo({
      isMobile,
      isDesktop: !isMobile,
      device: isMobile ? 'mobile' : 'desktop'
    });
  }, []);

  return deviceInfo;
};

export default useDeviceDetect;
