import React from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../../libs/components/layout/LayoutBasic';
import { Box, Grid } from '@mui/material';
import CSNav from '../../../libs/components/cs/CSNav';
import InquiryForm from '../../../libs/components/cs/InquiryForm';
import InquiryList from '../../../libs/components/cs/InquiryList';

const CSInquiryPage: NextPage = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      <CSNav />
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <InquiryForm />
        </Grid>
        <Grid item xs={12} md={5}>
          <InquiryList />
        </Grid>
      </Grid>
    </Box>
  );
};

export default withLayoutBasic(CSInquiryPage);



