import React from 'react';
import { Box, Grid, Paper, Typography, TextField, Stack, Button } from '@mui/material';
import Link from 'next/link';
import CSNav from './CSNav';
import FAQList from './FAQList';
import NoticeList from './NoticeList';

const CSHome: React.FC = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      <CSNav />

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          도움이 필요하신가요?
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="FAQ 검색 (예: 비밀번호 변경)" />
          <Link href="/cs/faq" style={{ textDecoration: 'none' }}>
            <Button variant="contained">검색</Button>
          </Link>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              자주 묻는 질문 Top
            </Typography>
            <FAQList limit={5} />
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Link href="/cs/faq">모든 FAQ 보기 →</Link>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              최근 공지
            </Typography>
            <NoticeList limit={5} />
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              빠른 작업
            </Typography>
            <Stack spacing={1}>
              <Link href="/cs/inquiry">1:1 문의하기</Link>
              <Link href="/contact">연락처 보기</Link>
              <Link href="/cs/terms">약관/정책 보기</Link>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CSHome;


