import React from 'react';
import { useTranslation } from 'next-i18next';
import { Box, Container, Typography, Paper } from '@mui/material';
import PropertyCreateForm from '../property/PropertyCreateForm';

const SellPageMobile: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <Box className="sell-page-mobile" sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="sm" sx={{ py: 2 }}>
        {/* 헤더 */}
        <Paper className="header-section" sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {t('Sell Your Bike')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('List your motorcycle for sale')}
          </Typography>
        </Paper>

        {/* 매물 등록 폼 */}
        <Paper className="form-section" sx={{ p: 2 }}>
          <PropertyCreateForm />
        </Paper>
      </Container>
    </Box>
  );
};

export default SellPageMobile;
