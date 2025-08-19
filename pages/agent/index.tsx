import React from 'react';
import { NextPage } from 'next';
import { GetStaticProps } from 'next';
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common'])),
    },
  };
};

export default withLayoutBasic(AgentPage); 