import React from 'react';
import { NextPage } from 'next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import SellPageMobile from '../../libs/components/sell/SellPageMobile';
import SellPageDesktop from '../../libs/components/sell/SellPageDesktop';

const SellPage: NextPage = () => {
  const device = useDeviceDetect();

  if (device.isMobile) {
    return <SellPageMobile />;
  }
  return <SellPageDesktop />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common'])),
    },
  };
};

export default withLayoutBasic(SellPage);
