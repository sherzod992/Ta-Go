import React from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../libs/components/layout/LayoutBasic';
import { Box } from '@mui/material';
import CSNav from '../libs/components/cs/CSNav';
import ContactCard from '../libs/components/cs/ContactCard';

const ContactPage: NextPage = () => {
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 4 }}>
      <CSNav />
      <ContactCard />
    </Box>
  );
};

export default withLayoutBasic(ContactPage);




