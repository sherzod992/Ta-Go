import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

const mockMessages = [
  { id: 'm1', author: 'me', content: '결제 취소가 가능한가요?', date: '2024-07-01 10:00' },
  { id: 'm2', author: 'admin', content: '안녕하세요, 주문번호를 알려주시면 확인해드리겠습니다.', date: '2024-07-01 10:05' },
];

const bubbleSx = (mine: boolean) => ({
  alignSelf: mine ? 'flex-end' : 'flex-start',
  backgroundColor: mine ? 'primary.main' : 'grey.100',
  color: mine ? 'primary.contrastText' : 'text.primary',
  px: 2,
  py: 1.5,
  borderRadius: 2,
  maxWidth: '75%',
});

const InquiryDetail: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>문의 상세</Typography>
      <Stack spacing={1.5}>
        {mockMessages.map((m) => (
          <Box key={m.id} sx={bubbleSx(m.author === 'me')}>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>{m.date}</Typography>
            <Typography>{m.content}</Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default InquiryDetail;


