import React from 'react';
import { Container, Typography, Paper, Tabs, Tab, Box } from '@mui/material';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';

const AdminCSPage: React.FC = () => {
  const [tab, setTab] = React.useState(0);
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Admin · CS</Typography>
      <Paper>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="cs tabs">
          <Tab label="FAQ" />
          <Tab label="Notice" />
          <Tab label="1:1 Inquiry" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && <Typography>FAQ 스켈레톤 (목업)</Typography>}
          {tab === 1 && <Typography>공지 스켈레톤 (목업)</Typography>}
          {tab === 2 && <Typography>1:1 문의 스켈레톤 (목업)</Typography>}
        </Box>
      </Paper>
    </Container>
  );
};

export default withAdminLayout(AdminCSPage);


