import React from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box } from '@mui/material';
import CSNav from '../../libs/components/cs/CSNav';
import FAQSearch from '../../libs/components/cs/FAQSearch';
import FAQList from '../../libs/components/cs/FAQList';

const CSFAQPage: NextPage = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      <CSNav />
      <FAQSearch />
      <FAQList />
    </Box>
  );
};

export async function getStaticProps({ locale = 'ko' }: { locale?: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default withLayoutBasic(CSFAQPage);



