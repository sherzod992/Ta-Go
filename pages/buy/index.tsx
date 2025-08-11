import React from 'react';
import { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import BuyPageMobile from '../../libs/components/buy/BuyPageMobile';
import BuyPageDesktop from '../../libs/components/buy/BuyPageDesktop';

const BuyPage: NextPage = () => {
  const device = useDeviceDetect();

  if (device.isMobile) {
    return <BuyPageMobile />;
  }

  return <BuyPageDesktop />;
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common'])),
    },
  };
};

export default withLayoutBasic(BuyPage);
