import React, { useState } from 'react';
import { NextPage } from 'next';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Stack,
  Divider,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';
import ResponsiveCard from '../libs/components/common/ResponsiveCard';
import ResponsiveGrid, { CardGrid, ProductGrid, AutoFitGrid } from '../libs/components/common/ResponsiveGrid';
import { useResponsive } from '../libs/hooks/useResponsive';

const ResponsiveDemo: NextPage = () => {
  const theme = useTheme();
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    currentBreakpoint, 
    windowSize,
    isPortrait,
    isLandscape 
  } = useResponsive();

  const [selectedVariant, setSelectedVariant] = useState<'default' | 'compact' | 'featured'>('default');

  // 데모 데이터
  const demoItems = [
    {
      id: 1,
      title: 'Adventure Motorcycle',
      subtitle: '2023 Honda Africa Twin',
      description: 'Perfect for long-distance touring with advanced electronics and comfortable ergonomics.',
      image: '/img/typeImages/ADVENTUREmoto.webp',
      price: '₩25,000,000',
      tags: ['Adventure', 'Touring', 'Honda'],
    },
    {
      id: 2,
      title: 'Sport Bike',
      subtitle: '2023 Yamaha R1',
      description: 'High-performance sport bike with cutting-edge technology and aerodynamic design.',
      image: '/img/typeImages/standart-naket.avif',
      price: '₩18,500,000',
      tags: ['Sport', 'Racing', 'Yamaha'],
    },
    {
      id: 3,
      title: 'Electric Motorcycle',
      subtitle: '2023 Zero SR/F',
      description: 'Zero-emission electric motorcycle with instant torque and modern connectivity.',
      image: '/img/typeImages/electric.avif',
      price: '₩32,000,000',
      tags: ['Electric', 'Eco-friendly', 'Zero'],
    },
    {
      id: 4,
      title: 'Dirt Bike',
      subtitle: '2023 KTM 450 EXC',
      description: 'Competition-ready dirt bike for off-road adventures and motocross racing.',
      image: '/img/typeImages/dirtbike.avif',
      price: '₩12,800,000',
      tags: ['Off-road', 'Motocross', 'KTM'],
    },
    {
      id: 5,
      title: 'Cruiser',
      subtitle: '2023 Harley-Davidson Street Glide',
      description: 'Classic American cruiser with iconic styling and powerful V-twin engine.',
      image: '/img/typeImages/standart-naket.avif',
      price: '₩28,500,000',
      tags: ['Cruiser', 'American', 'Harley'],
    },
    {
      id: 6,
      title: 'Scooter',
      subtitle: '2023 Vespa GTS 300',
      description: 'Stylish urban scooter perfect for city commuting and weekend rides.',
      image: '/img/typeImages/standart-naket.avif',
      price: '₩8,200,000',
      tags: ['Scooter', 'Urban', 'Vespa'],
    },
  ];

  const getDeviceIcon = () => {
    if (isMobile) return <PhoneIcon />;
    if (isTablet) return <TabletIcon />;
    if (isDesktop) return <LaptopIcon />;
    return <ComputerIcon />;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          }}
        >
          반응형 웹 디자인 데모
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            mb: 4,
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
          }}
        >
          화면 크기에 따라 자동으로 조정되는 컴포넌트들을 확인해보세요
        </Typography>

        {/* 현재 디바이스 정보 */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 4,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getDeviceIcon()}
              <Typography variant="h6">
                {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Typography variant="body2" color="text.secondary">
              Breakpoint: {currentBreakpoint.toUpperCase()}
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Typography variant="body2" color="text.secondary">
              {windowSize.width} × {windowSize.height}
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Typography variant="body2" color="text.secondary">
              {isPortrait ? 'Portrait' : 'Landscape'}
            </Typography>
          </Stack>
        </Paper>

        {/* 경고 메시지 */}
        <Alert severity="info" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
          <Typography variant="body2">
            브라우저 창의 크기를 조절하거나 개발자 도구의 디바이스 시뮬레이션을 사용하여 
            다양한 화면 크기에서의 반응형 동작을 확인해보세요.
          </Typography>
        </Alert>
      </Box>

      {/* 카드 변형 선택 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          카드 스타일 선택
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          {(['default', 'compact', 'featured'] as const).map((variant) => (
            <Button
              key={variant}
              variant={selectedVariant === variant ? 'contained' : 'outlined'}
              onClick={() => setSelectedVariant(variant)}
              sx={{ textTransform: 'capitalize' }}
            >
              {variant}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* 기본 그리드 데모 */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          기본 반응형 그리드
        </Typography>
        <ResponsiveGrid
          columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
          spacing={{ xs: 1.5, sm: 2, md: 2.5, lg: 3 }}
        >
          {demoItems.map((item) => (
            <ResponsiveCard
              key={item.id}
              variant={selectedVariant}
              title={item.title}
              subtitle={item.subtitle}
              description={item.description}
              image={item.image}
              price={item.price}
              tags={item.tags}
              isLiked={Math.random() > 0.5}
              isBookmarked={Math.random() > 0.7}
              onLike={() => console.log('Liked:', item.title)}
              onShare={() => console.log('Shared:', item.title)}
              onBookmark={() => console.log('Bookmarked:', item.title)}
              onClick={() => console.log('Clicked:', item.title)}
            />
          ))}
        </ResponsiveGrid>
      </Box>

      {/* 자동 맞춤 그리드 데모 */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          자동 맞춤 그리드 (Auto-fit)
        </Typography>
        <AutoFitGrid minItemWidth={280}>
          {demoItems.slice(0, 4).map((item) => (
            <ResponsiveCard
              key={item.id}
              variant="compact"
              title={item.title}
              subtitle={item.subtitle}
              description={item.description}
              image={item.image}
              price={item.price}
              tags={item.tags}
            />
          ))}
        </AutoFitGrid>
      </Box>

      {/* 제품 그리드 데모 */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          제품 그리드 (더 많은 컬럼)
        </Typography>
        <ProductGrid>
          {demoItems.map((item) => (
            <ResponsiveCard
              key={item.id}
              variant="compact"
              title={item.title}
              subtitle={item.subtitle}
              description={item.description}
              image={item.image}
              price={item.price}
              tags={item.tags}
            />
          ))}
        </ProductGrid>
      </Box>

      {/* 반응형 레이아웃 데모 */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          반응형 레이아웃 데모
        </Typography>
        <Grid container spacing={3}>
          {/* 사이드바 */}
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                height: { xs: 'auto', md: 400 },
                position: { xs: 'static', md: 'sticky' },
                top: 20,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                사이드바
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                데스크톱에서는 고정된 사이드바로, 모바일에서는 상단에 표시됩니다.
              </Typography>
              <Stack spacing={1}>
                <Chip label="필터 1" size="small" />
                <Chip label="필터 2" size="small" />
                <Chip label="필터 3" size="small" />
              </Stack>
            </Paper>
          </Grid>

          {/* 메인 콘텐츠 */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                메인 콘텐츠
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                화면 크기에 따라 레이아웃이 자동으로 조정됩니다.
              </Typography>
              
              <CardGrid>
                {demoItems.slice(0, 3).map((item) => (
                  <ResponsiveCard
                    key={item.id}
                    variant="default"
                    title={item.title}
                    subtitle={item.subtitle}
                    description={item.description}
                    image={item.image}
                    price={item.price}
                    tags={item.tags}
                  />
                ))}
              </CardGrid>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 반응형 텍스트 데모 */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          반응형 텍스트 데모
        </Typography>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem', lg: '5rem' },
              lineHeight: { xs: 1.2, md: 1.1 },
              mb: 2,
            }}
          >
            반응형 제목
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' },
              color: 'text.secondary',
              mb: 3,
            }}
          >
            화면 크기에 따라 폰트 크기가 자동으로 조정됩니다
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              lineHeight: 1.6,
            }}
          >
            이 텍스트는 다양한 화면 크기에서 최적의 가독성을 제공하도록 설계되었습니다. 
            모바일에서는 작은 폰트로, 데스크톱에서는 큰 폰트로 자동 조정됩니다.
          </Typography>
        </Paper>
      </Box>

      {/* 반응형 스페이싱 데모 */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          반응형 스페이싱 데모
        </Typography>
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Paper
                sx={{
                  p: { xs: 1.5, sm: 2, md: 3 },
                  textAlign: 'center',
                  height: { xs: 100, sm: 120, md: 150 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                  }}
                >
                  아이템 {item}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default ResponsiveDemo;
