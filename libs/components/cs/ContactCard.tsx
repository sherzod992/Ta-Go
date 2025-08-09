import React from 'react';
import { Paper, Stack, Typography } from '@mui/material';

const ContactCard: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>연락처</Typography>
      <Stack spacing={1}>
        <Typography>이메일: support@ta-go.example</Typography>
        <Typography>전화: 02-000-0000 (평일 09:00~18:00)</Typography>
        <Typography>채팅: CS 페이지의 1:1 문의 이용</Typography>
      </Stack>
    </Paper>
  );
};

export default ContactCard;


