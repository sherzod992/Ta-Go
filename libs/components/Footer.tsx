import React from 'react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import FooterDesktop from './footer/FooterDesktop';
import FooterMobile from './footer/FooterMobile';

const Footer: React.FC = () => {
  const { isMobile } = useDeviceDetect();

  return isMobile ? <FooterMobile /> : <FooterDesktop />;
};

export default Footer;
