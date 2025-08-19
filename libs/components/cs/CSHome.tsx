import React from 'react';
import { Box, Grid, Paper, Typography, TextField, Stack, Button } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import CSNav from './CSNav';
import FAQList from './FAQList';
import NoticeList from './NoticeList';

const CSHome: React.FC = () => {
  const { t } = useTranslation('common');
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        <CSNav />

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
            {t('Need Help')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth placeholder={t('FAQ Search') + ' (예: 비밀번호 변경)'} />
            <Link href="/cs/faq" style={{ textDecoration: 'none' }}>
              <Button variant="contained">{t('Search')}</Button>
            </Link>
          </Stack>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                {t('FAQ Top')}
              </Typography>
              <FAQList limit={5} />
              <Box sx={{ textAlign: 'right', mt: 1 }}>
                <Link href="/cs/faq">{t('View All FAQ')} →</Link>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                {t('Recent Notices')}
              </Typography>
              <NoticeList limit={5} />
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                {t('Quick Actions')}
              </Typography>
              <Stack spacing={1}>
                <Link href="/cs/inquiry">{t('1:1 Inquiry')}</Link>
                <Link href="/contact">{t('View Contact')}</Link>
                <Link href="/cs/terms">{t('View Terms')}</Link>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CSHome;


