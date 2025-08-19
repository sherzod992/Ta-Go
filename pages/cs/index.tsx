import React from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import CSHome from '../../libs/components/cs/CSHome';

const CSPage: NextPage = () => {
  return <CSHome />;
};

export async function getStaticProps({ locale = 'ko' }: { locale?: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default withLayoutBasic(CSPage);