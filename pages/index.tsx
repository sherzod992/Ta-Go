import React from 'react';
import { NextPage } from 'next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Box, Container, Stack } from '@mui/material';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutHome from '../libs/components/layout/LayoutHome';

// 홈페이지 컴포넌트들
import HeroSection from '../libs/components/homepage/HeroSection';
import SuggestedBikes from '../libs/components/homepage/SuggestedBikes';
import NewBikeShowroom from '../libs/components/homepage/NewBikeShowroom';
import ExpertReviews from '../libs/components/homepage/ExpertReviews';
import BikeNews from '../libs/components/homepage/BikeNews';

const HomePage: NextPage = () => {
  const { t } = useTranslation('common');
  const device = useDeviceDetect();

  // 모바일: 핵심 기능만 표시 (6개 섹션)
  if (device === 'mobile') {
    return (
      <Box>
        <Container maxWidth="xl" sx={{ padding: 0 }}>
          <Stack spacing={0}>
            {/* 1. 히어로 섹션 */}
            <HeroSection />
            
            {/* 2. 추천 바이크 */}
            <SuggestedBikes />
            
            {/* 3. 신차 쇼룸 */}
            <NewBikeShowroom />
            
            {/* 4. 전문가 리뷰 */}
            <ExpertReviews />
            
            {/* 5. 최신 뉴스 */}
            <BikeNews />
            
            {/* 6. 추가 모바일 전용 섹션 (예: 빠른 검색) */}
            <Box sx={{ py: 4, backgroundColor: '#f8f9fa' }}>
              <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center' }}>
                  <h2 style={{ marginBottom: '1rem', color: '#333' }}>
                    {t('Quick Search')}
                  </h2>
                  <p style={{ color: '#666' }}>
                    {t('Find your perfect bike in seconds')}
                  </p>
                </Box>
              </Container>
            </Box>
          </Stack>
        </Container>
      </Box>
    );
  }

  // 데스크톱: 전체 기능 표시 (7개 섹션)
  return (
    <Box>
      <Container maxWidth="xl" sx={{ padding: 0 }}>
        <Stack spacing={0}>
          {/* 1. 히어로 섹션 */}
          <HeroSection />
          
          {/* 2. 추천 바이크 */}
          <SuggestedBikes />
          
          {/* 3. 신차 쇼룸 */}
          <NewBikeShowroom />
          
          {/* 4. 전문가 리뷰 */}
          <ExpertReviews />
          
          {/* 5. 최신 뉴스 */}
          <BikeNews />
          
          {/* 6. 데스크톱 전용: 통계 섹션 */}
          <Box sx={{ py: 6, backgroundColor: '#2c3e50', color: 'white' }}>
            <Container maxWidth="lg">
              <Box sx={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>
                  {t('Why Choose Us')}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>10,000+</h3>
                    <p>{t('Bikes Available')}</p>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>500+</h3>
                    <p>{t('Expert Reviews')}</p>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>24/7</h3>
                    <p>{t('Customer Support')}</p>
                  </div>
                </div>
              </Box>
            </Container>
          </Box>
          
          {/* 7. 데스크톱 전용: 뉴스레터 구독 */}
          <Box sx={{ py: 6, backgroundColor: '#ecf0f1' }}>
            <Container maxWidth="lg">
              <Box sx={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1rem', color: '#333' }}>
                  {t('Stay Updated')}
                </h2>
                <p style={{ marginBottom: '2rem', color: '#666' }}>
                  {t('Get the latest news and updates about motorcycles')}
                </p>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <input 
                    type="email" 
                    placeholder={t('Enter your email')}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      width: '300px',
                      fontSize: '16px'
                    }}
                  />
                  <button style={{
                    padding: '12px 24px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}>
                    {t('Subscribe')}
                  </button>
                </Box>
              </Box>
            </Container>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common'])),
    },
  };
};

export default withLayoutHome(HomePage);
