import React from 'react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import TopDesktop from './top/TopDesktop';
import TopMobile from './top/TopMobile';

const Top: React.FC = () => {
  const { isMobile } = useDeviceDetect();

  return isMobile ? <TopMobile /> : <TopDesktop />;
};

export default Top;
