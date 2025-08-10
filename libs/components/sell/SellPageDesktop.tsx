import React from 'react';
import { useTranslation } from 'next-i18next';
import { Box, Container, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import PropertyCreateForm from '../property/PropertyCreateForm';

const SellPageDesktop: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <Box className="sell-page-desktop" sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 헤더 */}
        <Paper className="header-section" sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {t('Sell Your Bike')}
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            {t('List your motorcycle for sale and reach thousands of potential buyers')}
          </Typography>
        </Paper>

        <Grid container spacing={4}>
          {/* 매물 등록 폼 */}
          <Grid item xs={12} md={8}>
            <Paper className="form-section" sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                {t('Property Information')}
              </Typography>
              <PropertyCreateForm />
            </Paper>
          </Grid>

          {/* 사이드바 정보 */}
          <Grid item xs={12} md={4} className="sidebar-section">
            <Card className="tips-card" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('Selling Tips')}
                </Typography>
                <Typography variant="body2" paragraph>
                  • {t('Take clear, high-quality photos')}
                </Typography>
                <Typography variant="body2" paragraph>
                  • {t('Provide detailed description')}
                </Typography>
                <Typography variant="body2" paragraph>
                  • {t('Set a competitive price')}
                </Typography>
                <Typography variant="body2" paragraph>
                  • {t('Respond quickly to inquiries')}
                </Typography>
              </CardContent>
            </Card>

            <Card className="tips-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('Why Sell With Us')}
                </Typography>
                <Typography variant="body2" paragraph>
                  • {t('Large buyer network')}
                </Typography>
                <Typography variant="body2" paragraph>
                  • {t('Secure payment system')}
                </Typography>
                <Typography variant="body2" paragraph>
                  • {t('Professional support')}
                </Typography>
                <Typography variant="body2" paragraph>
                  • {t('Easy listing process')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SellPageDesktop;
