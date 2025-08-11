import React from 'react';
import { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import AgentMobile from '../../libs/components/agent/AgentMobile';
import AgentDesktop from '../../libs/components/agent/AgentDesktop';

const AgentPage: NextPage = () => {
  const device = useDeviceDetect();

  if (device.isMobile) {
    return <AgentMobile />;
  }
  return <AgentDesktop />;
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common'])),
    },
  };
};

export default withLayoutBasic(AgentPage); 