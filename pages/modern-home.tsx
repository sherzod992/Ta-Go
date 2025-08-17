import React from 'react';
import { Box, Button, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import withLayoutModern from '../libs/components/layout/LayoutModern';
import ModernCardGrid from '../libs/components/common/ModernCardGrid';
import FluidTypography from '../libs/components/common/FluidTypography';
import ModernNavigation from '../libs/components/common/ModernNavigation';

// 현대적인 섹션 스타일
const ModernSection = styled(Box)(({ theme }) => ({
  padding: 'clamp(4rem, 10vw, 8rem) 0',
  width: '100%',
  position: 'relative',
  
  '&.hero-section': {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textAlign: 'center',
  },
  
  '&.features-section': {
    background: '#f8fafc',
  },
  
  '&.cta-section': {
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    color: 'white',
    textAlign: 'center',
  },
}));

// 유동적 버튼 스타일
const FluidButton = styled(Button)(({ theme }) => ({
  padding: 'clamp(0.75rem, 2vw, 1.5rem) clamp(1.5rem, 4vw, 3rem)',
  fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
  borderRadius: 'clamp(0.5rem, 1.5vw, 1rem)',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease-in-out',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
  },
}));

const ModernHomePage: React.FC = () => {
  // 샘플 데이터
  const featuredProperties = [
    {
      id: '1',
      title: '2023 Honda CBR1000RR',
      description: '최신 스포츠바이크, 완벽한 상태, 저렴한 가격',
      image: '/img/home/home1.jpg',
      price: '₩15,000,000',
      status: 'available' as const,
      tags: ['Sport', '1000cc', '2023']
    },
    {
      id: '2',
      title: '2022 Yamaha MT-09',
      description: '강력한 토크와 편안한 주행감을 제공하는 네이키드 바이크',
      image: '/img/home/home2.jpg',
      price: '₩12,500,000',
      status: 'available' as const,
      tags: ['Naked', '900cc', '2022']
    },
    {
      id: '3',
      title: '2021 BMW R1250GS',
      description: '어떤 도로든 정복할 수 있는 어드벤처 투어링 바이크',
      image: '/img/home/home3.jpg',
      price: '₩25,000,000',
      status: 'pending' as const,
      tags: ['Adventure', '1250cc', '2021']
    },
    {
      id: '4',
      title: '2020 Ducati Monster 821',
      description: '이탈리아의 아름다운 디자인과 강력한 성능',
      image: '/img/home/home1.jpg',
      price: '₩18,500,000',
      status: 'sold' as const,
      tags: ['Naked', '821cc', '2020']
    },
    {
      id: '5',
      title: '2023 Suzuki V-Strom 650',
      description: '신뢰할 수 있는 성능과 경제적인 연비',
      image: '/img/home/home2.jpg',
      price: '₩9,800,000',
      status: 'available' as const,
      tags: ['Adventure', '650cc', '2023']
    },
    {
      id: '6',
      title: '2022 Kawasaki Ninja 400',
      description: '초보자도 쉽게 탈 수 있는 스포츠바이크',
      image: '/img/home/home3.jpg',
      price: '₩7,200,000',
      status: 'available' as const,
      tags: ['Sport', '400cc', '2022']
    }
  ];

  return (
    <>
      <ModernNavigation />
      
      {/* 히어로 섹션 */}
      <ModernSection className="hero-section">
        <Container maxWidth="xl" className="responsive-container">
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <FluidTypography 
              variant="h1" 
              gradient 
              glow
              sx={{ mb: 3 }}
            >
              Find Your Perfect Motorcycle
            </FluidTypography>
            
            <FluidTypography 
              variant="h4" 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                lineHeight: 1.4
              }}
            >
              Discover the best motorcycles from trusted sellers and expert agents. 
              Buy, sell, and connect with the motorcycle community.
            </FluidTypography>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <FluidButton 
                variant="contained" 
                size="large"
                sx={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                Browse Motorcycles
              </FluidButton>
              
              <FluidButton 
                variant="outlined" 
                size="large"
                sx={{ 
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Sell Your Bike
              </FluidButton>
            </Box>
          </Box>
        </Container>
      </ModernSection>

      {/* 피처드 프로퍼티 섹션 */}
      <ModernSection className="features-section">
        <ModernCardGrid
          items={featuredProperties}
          title="Featured Motorcycles"
          subtitle="Discover the most popular motorcycles from our trusted sellers"
        />
      </ModernSection>

      {/* 통계 섹션 */}
      <ModernSection>
        <Container maxWidth="xl" className="responsive-container">
          <Box className="fluid-grid">
            <Box sx={{ textAlign: 'center' }}>
              <FluidTypography variant="h2" gradient sx={{ mb: 1 }}>
                1,500+
              </FluidTypography>
              <FluidTypography variant="h5" sx={{ color: '#666' }}>
                Motorcycles Listed
              </FluidTypography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <FluidTypography variant="h2" gradient sx={{ mb: 1 }}>
                500+
              </FluidTypography>
              <FluidTypography variant="h5" sx={{ color: '#666' }}>
                Trusted Agents
              </FluidTypography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <FluidTypography variant="h2" gradient sx={{ mb: 1 }}>
                10,000+
              </FluidTypography>
              <FluidTypography variant="h5" sx={{ color: '#666' }}>
                Happy Customers
              </FluidTypography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <FluidTypography variant="h2" gradient sx={{ mb: 1 }}>
                50+
              </FluidTypography>
              <FluidTypography variant="h5" sx={{ color: '#666' }}>
                Cities Covered
              </FluidTypography>
            </Box>
          </Box>
        </Container>
      </ModernSection>

      {/* CTA 섹션 */}
      <ModernSection className="cta-section">
        <Container maxWidth="xl" className="responsive-container">
          <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
            <FluidTypography variant="h2" sx={{ mb: 3 }}>
              Ready to Find Your Dream Motorcycle?
            </FluidTypography>
            
            <FluidTypography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of motorcycle enthusiasts who trust ta-Go for their next ride.
            </FluidTypography>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <FluidButton 
                variant="contained" 
                size="large"
                sx={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                Get Started Today
              </FluidButton>
              
              <FluidButton 
                variant="outlined" 
                size="large"
                sx={{ 
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Learn More
              </FluidButton>
            </Box>
          </Box>
        </Container>
      </ModernSection>
    </>
  );
};

export default withLayoutModern(ModernHomePage);
