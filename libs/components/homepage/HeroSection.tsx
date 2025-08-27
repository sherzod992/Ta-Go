import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Button, 
  Chip,
  Paper,
  CircularProgress,
  Slider,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { PropertyLocation, PropertyType, PropertyStatus, PropertyCondition } from '../../enums/property.enum';

const HeroSection: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [brand, setBrand] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('all');

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const bikeCategories = [
    { name: 'Adventure Tourers', value: PropertyType.ADVENTURE_TOURERS, image: '/img/typeImages/ADVENTUREmoto.webp' },
    { name: 'Agriculture', value: PropertyType.AGRICULTURE, image: '/img/typeImages/AGRICULTUREmoto.png' },
    { name: 'All Terrain Vehicles', value: PropertyType.ALL_TERRAIN_VEHICLES, image: '/img/typeImages/ALL_TERRAIN.jpg' },
    { name: 'Dirt Bikes', value: PropertyType.DIRT, image: '/img/typeImages/dirtbike.avif' },
    { name: 'Electric', value: PropertyType.ELECTRIC, image: '/img/typeImages/electric.avif' },
    { name: 'Enduro', value: PropertyType.ENDURO, image: '/img/typeImages/dirt-bikes.png' },
    { name: 'Mini Bikes', value: PropertyType.MINI_BIKES, image: '/img/typeImages/minibikes.jpg' },
    { name: 'SxS/UTV', value: PropertyType.SXS_UTV, image: '/img/typeImages/UTVbikes.avif' }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // 검색 필터 변수 생성
  const searchVariables = useMemo(() => {
    const search: any = {};

    if (brand !== 'all') search.brandList = [brand];
    if (keyword) search.text = keyword;
    if (selectedCategory !== 'all') {
      // 카테고리 이름을 enum 값으로 변환
      const categoryMap: { [key: string]: PropertyType } = {
        'Adventure Tourers': PropertyType.ADVENTURE_TOURERS,
        'Agriculture': PropertyType.AGRICULTURE,
        'All Terrain Vehicles': PropertyType.ALL_TERRAIN_VEHICLES,
        'Dirt Bikes': PropertyType.DIRT,
        'Electric': PropertyType.ELECTRIC,
        'Enduro': PropertyType.ENDURO,
        'Mini Bikes': PropertyType.MINI_BIKES,
        'SxS/UTV': PropertyType.SXS_UTV
      };
      const selectedType = categoryMap[selectedCategory];
      if (selectedType) {
        search.typeList = [selectedType];
      }
    }
    if (location !== 'all') {
      // 위치 이름을 enum 값으로 변환
      const locationMap: { [key: string]: PropertyLocation } = {
        'seoul': PropertyLocation.SEOUL,
        'busan': PropertyLocation.BUSAN,
        'daegu': PropertyLocation.DAEGU
      };
      search.locationList = [locationMap[location]];
    }

    if (priceRange[0] > 0 || priceRange[1] < 50000000) {
      search.pricesRange = {
        start: priceRange[0],
        end: priceRange[1]
      };
    }

    return {
      input: {
        page: 1,
        limit: 1000, // 충분히 큰 수로 설정하여 모든 결과를 가져옴
        search
      }
    };
  }, [brand, keyword, selectedCategory, location, priceRange]);

  // GraphQL 쿼리 실행
  const { data, loading, error } = useQuery(GET_PROPERTIES, {
    variables: searchVariables,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  // 검색 결과 개수
  const searchResultCount = data?.getProperties?.list?.length || 0;

  const handleClearAll = () => {
    setBrand('all');
    setKeyword('');
    setSelectedCategory('all');
    setLocation('all');
    setPriceRange([0, 50000000]);
  };

  const handleShowBikes = () => {
    if (searchResultCount > 0) {
      // 검색 결과가 있을 때만 페이지 이동
      const queryParams = new URLSearchParams();
      if (brand !== 'all') queryParams.append('brand', brand);
      if (keyword) queryParams.append('keyword', keyword);
      if (selectedCategory !== 'all') queryParams.append('category', selectedCategory);
      if (location !== 'all') queryParams.append('location', location);

      if (priceRange[0] > 0) queryParams.append('priceMin', priceRange[0].toString());
      if (priceRange[1] < 50000000) queryParams.append('priceMax', priceRange[1].toString());
      
      router.push(`/property?${queryParams.toString()}`);
    }
  };

  return (
    <Box sx={{ 
      position: 'relative',
      minHeight: '600px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      padding: '2rem 0',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Background Image */}
      <Box
        className="background-image"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/img/home/home2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
        }}
      />

      {/* Content Container */}
      <Box
        className="content-container"
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
        }}
      >
        {/* Hero Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 900,
              fontSize: { xs: '2.5rem', md: '4rem' },
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              mb: 2,
            }}
          >
            {t('Find Your Perfect Motorcycle')}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              opacity: 0.9,
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            {t('Discover thousands of motorcycles from trusted sellers')}
          </Typography>
        </Box>

        {/* Search Filter Card */}
        <Card
          className="search-filter-card"
          sx={{
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ padding: { xs: '1rem', md: '2rem' } }}>
            <Typography
              className="filter-title"
              variant="h4"
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                color: '#333',
                marginBottom: '2rem',
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              {t('Search Your Dream Bike')}
            </Typography>

            {/* 검색 조건 영역 - 키워드, 브랜드, 위치를 한 줄에 3개 배치 */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'row',
              gap: 2,
              marginBottom: 2,
              flexWrap: 'nowrap'
            }}>
              {/* 키워드 */}
              <FormControl sx={{ 
                width: '33.33%',
                flex: '0 0 33.33%'
              }}>
                <TextField
                  label={t('Keyword')}
                  placeholder={t('Search by model, year...')}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  size={isMobile ? 'small' : 'medium'}
                  fullWidth
                />
              </FormControl>

              {/* 브랜드 */}
              <FormControl sx={{ 
                width: '33.33%',
                flex: '0 0 33.33%'
              }}>
                <InputLabel sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>{t('Brand')}</InputLabel>
                <Select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  label={t('Brand')}
                  size={isMobile ? 'small' : 'medium'}
                >
                  <MenuItem value="all">{t('All Brands')}</MenuItem>
                  <MenuItem value="honda">Honda</MenuItem>
                  <MenuItem value="yamaha">Yamaha</MenuItem>
                  <MenuItem value="suzuki">Suzuki</MenuItem>
                  <MenuItem value="kawasaki">Kawasaki</MenuItem>
                  <MenuItem value="bmw">BMW</MenuItem>
                  <MenuItem value="ducati">Ducati</MenuItem>
                </Select>
              </FormControl>

              {/* 위치 */}
              <FormControl sx={{ 
                width: '33.33%',
                flex: '0 0 33.33%'
              }}>
                <InputLabel sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>{t('Location')}</InputLabel>
                <Select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  label={t('Location')}
                  size={isMobile ? 'small' : 'medium'}
                >
                  <MenuItem value="all">{t('All Locations')}</MenuItem>
                  <MenuItem value="seoul">Seoul</MenuItem>
                  <MenuItem value="busan">Busan</MenuItem>
                  <MenuItem value="daegu">Daegu</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* 바이크 카테고리 영역 - 하나의 큰 컨테이너 안에 모든 카테고리 배치 */}
            <Box sx={{ 
              marginBottom: 2,
              padding: 3,
              border: '2px solid #e0e0e0',
              borderRadius: 3,
              backgroundColor: '#f8f9fa'
            }}>
              <Typography variant="body2" gutterBottom sx={{ 
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center'
              }}>
                {t('Bike Categories')}:
              </Typography>
              
              {/* 통합된 바이크 카테고리 그리드 - 8개를 한 줄에 배치 */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { 
                  xs: 'repeat(2, 1fr)', 
                  sm: 'repeat(4, 1fr)', 
                  md: 'repeat(6, 1fr)',
                  lg: 'repeat(8, 1fr)'
                },
                gap: { xs: 1, sm: 1.5, md: 1.5 },
                justifyContent: 'center',
                alignItems: 'start'
              }}>
                {bikeCategories.map((categoryItem) => (
                  <Box
                    key={categoryItem.value}
                    onClick={() => setSelectedCategory(categoryItem.name)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: { xs: 0.5, sm: 1, md: 1, lg: 0.5 },
                      border: selectedCategory === categoryItem.name ? '3px solid #1976d2' : '2px solid #e0e0e0',
                      borderRadius: { xs: 2, sm: 3 },
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backgroundColor: selectedCategory === categoryItem.name ? 'rgba(25, 118, 210, 0.08)' : 'white',
                      boxShadow: selectedCategory === categoryItem.name 
                        ? '0 4px 12px rgba(25, 118, 210, 0.2)' 
                        : '0 2px 8px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        backgroundColor: selectedCategory === categoryItem.name 
                          ? 'rgba(25, 118, 210, 0.12)' 
                          : 'rgba(25, 118, 210, 0.04)',
                        borderColor: '#1976d2',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(25, 118, 210, 0.25)',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={categoryItem.image}
                      alt={categoryItem.name}
                      sx={{
                        width: { xs: '50px', sm: '60px', md: '70px', lg: '60px' },
                        height: { xs: '50px', sm: '60px', md: '70px', lg: '60px' },
                        objectFit: 'cover',
                        borderRadius: { xs: 1, sm: 2 },
                        marginBottom: { xs: 0.5, sm: 0.5 },
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                    <Typography
                      variant={isMobile ? 'caption' : 'body2'}
                      sx={{
                        textAlign: 'center',
                        fontWeight: selectedCategory === categoryItem.name ? 600 : 500,
                        color: selectedCategory === categoryItem.name ? '#1976d2' : '#333',
                        fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem', lg: '0.7rem' },
                        lineHeight: 1.2,
                        transition: 'all 0.3s ease',
                        wordBreak: 'break-word',
                      }}
                    >
                      {categoryItem.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>



            {/* Price Range Filter - 매물 타입 바로 아래로 이동 */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body2" gutterBottom sx={{ 
                fontSize: { xs: '0.9rem', md: '1.1rem' },
                fontWeight: { xs: 500, md: 600 },
                color: '#333',
                marginBottom: { xs: 1, md: 1.5 }
              }}>
                {t('Price Range')}: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              </Typography>
              <Box sx={{ 
                padding: { xs: '0 8px', md: '0 16px' },
                marginBottom: 1
              }}>
                <Slider
                  value={priceRange}
                  onChange={(_, value) => setPriceRange(value as [number, number])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={50000000}
                  step={1000000}
                  valueLabelFormat={(value) => formatPrice(value)}
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: { xs: 20, md: 24 },
                      height: { xs: 20, md: 24 },
                      backgroundColor: '#1976d2',
                      border: '3px solid white',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        transform: 'scale(1.1)',
                      },
                      '&.Mui-active': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
                      },
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#1976d2',
                      height: { xs: 4, md: 6 },
                      borderRadius: 2,
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: '#e0e0e0',
                      height: { xs: 4, md: 6 },
                      borderRadius: 2,
                    },
                    '& .MuiSlider-valueLabel': {
                      backgroundColor: '#1976d2',
                      fontSize: { xs: '0.75rem', md: '0.9rem' },
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: '4px',
                    },
                  }}
                />
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: { xs: '0.75rem', md: '0.85rem' },
                color: '#666',
                padding: { xs: '0 8px', md: '0 16px' }
              }}>
                <span>₩0</span>
                <span>₩50,000,000</span>
              </Box>
            </Box>

            {/* Action Buttons Row - 모바일에서는 한 줄에 나란히 정렬 */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              marginBottom: 2,
              flexDirection: { xs: 'row', md: 'row' }
            }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={searchResultCount === 0}
                onClick={handleShowBikes}
                sx={{
                  height: { xs: '48px', md: '48px' },
                  backgroundColor: searchResultCount === 0 ? 'rgba(0, 0, 0, 0.12)' : '#d32f2f',
                  color: searchResultCount === 0 ? 'rgba(0, 0, 0, 0.26)' : 'white',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  fontWeight: { xs: 500, md: 600 },
                  flex: { xs: 1, md: 1 },
                  '&:hover': { 
                    backgroundColor: searchResultCount === 0 ? 'rgba(0, 0, 0, 0.12)' : '#b71c1c',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                    color: 'rgba(0, 0, 0, 0.26)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `${t('Show bikes')} (${searchResultCount})`
                )}
              </Button>
              <IconButton
                color="error"
                onClick={handleClearAll}
                sx={{ 
                  height: { xs: '48px', md: '48px' },
                  width: { xs: '48px', md: '48px' },
                  border: '2px solid',
                  borderColor: 'error.main',
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Box>

            {/* 검색 결과 안내 */}
            {!loading && searchResultCount === 0 && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 1, border: '1px solid #ffc107' }}>
                <Typography variant="body2" color="warning.main">
                  {t('No bikes found')} - {t('Try adjusting your search criteria')}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default HeroSection; 