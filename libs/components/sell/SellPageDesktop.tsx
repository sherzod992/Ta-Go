import React from 'react';
import { useTranslation } from 'next-i18next';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, Alert, Button } from '@mui/material';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import PropertyCreateForm from '../property/PropertyCreateForm';
import { MemberType } from '../../enums/member.enum';

const SellPageDesktop: React.FC = () => {
  const { t } = useTranslation('common');
  const user = useReactiveVar(userVar);

  // Admin 권한 확인
  const isAdmin = user?.memberType === MemberType.ADMIN;

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

        {/* Admin 권한 제한 알림 */}
        {isAdmin && (
          <Alert severity="warning" sx={{ mb: 4 }}>
            <Typography variant="body1" gutterBottom>
              <strong>관리자 계정으로는 매물을 등록할 수 없습니다.</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              매물 등록은 일반 사용자 계정으로만 가능합니다. 관리자 계정은 매물 관리 및 시스템 관리 기능만 사용할 수 있습니다.
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => window.history.back()}
            >
              이전 페이지로 돌아가기
            </Button>
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* 매물 등록 폼 */}
          <Grid item xs={12} md={8}>
            <Paper 
              className="form-section" 
              sx={{ 
                p: 4,
                opacity: isAdmin ? 0.5 : 1,
                pointerEvents: isAdmin ? 'none' : 'auto',
                position: 'relative'
              }}
            >
              {isAdmin && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                    cursor: 'not-allowed'
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    관리자는 매물을 등록할 수 없습니다
                  </Typography>
                </Box>
              )}
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
