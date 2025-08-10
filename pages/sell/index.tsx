import React from 'react';
import { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import SellPageMobile from '../../libs/components/sell/SellPageMobile';
import SellPageDesktop from '../../libs/components/sell/SellPageDesktop';

const SellPage: NextPage = () => {
  const device = useDeviceDetect();

  if (device === 'mobile') {
    return <SellPageMobile />;
  }

  return <SellPageDesktop />;
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common'])),
    },
  };
};

export default withLayoutBasic(SellPage);
