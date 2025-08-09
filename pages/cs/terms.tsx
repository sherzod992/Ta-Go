import React from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box } from '@mui/material';
import CSNav from '../../libs/components/cs/CSNav';
import TermsViewer from '../../libs/components/cs/TermsViewer';

const CSTermsPage: NextPage = () => {
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 4 }}>
      <CSNav />
      <TermsViewer />
    </Box>
  );
};

export default withLayoutBasic(CSTermsPage);




