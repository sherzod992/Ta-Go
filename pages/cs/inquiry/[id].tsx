import React from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../../libs/components/layout/LayoutBasic';
import { Box } from '@mui/material';
import CSNav from '../../../libs/components/cs/CSNav';
import InquiryDetail from '../../../libs/components/cs/InquiryDetail';

const CSInquiryDetailPage: NextPage = () => {
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 4 }}>
      <CSNav />
      <InquiryDetail />
    </Box>
  );
};

export default withLayoutBasic(CSInquiryDetailPage);




