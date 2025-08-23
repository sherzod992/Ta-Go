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
  useMediaQuery
} from '@mui/material';
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
  const [condition, setCondition] = useState('all');
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
    if (condition !== 'all') {
      // 상태 이름을 enum 값으로 변환
      const conditionMap: { [key: string]: PropertyCondition } = {
        'new': PropertyCondition.EXCELLENT,
        'used': PropertyCondition.GOOD
      };
      search.options = [conditionMap[condition]];
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
  }, [brand, keyword, selectedCategory, location, condition, priceRange]);

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
    setCondition('all');
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
      if (condition !== 'all') queryParams.append('condition', condition);
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

            {/* 매물 타입 영역 - PC에서는 한 줄로, 모바일에서는 가로 스크롤로 */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body2" gutterBottom sx={{ 
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 500,
                marginBottom: 1
              }}>
                {t('Bike Categories')}:
              </Typography>
              
              {isMobile ? (
                // 모바일: 가로 스크롤로 4개씩 보이기
                <Box sx={{
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  paddingBottom: 1,
                  scrollSnapType: 'x mandatory',
                  '&::-webkit-scrollbar': {
                    height: 4,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                    borderRadius: 2,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#c1c1c1',
                    borderRadius: 2,
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                }}>
                  {bikeCategories.map((categoryItem) => (
                    <Box
                      key={categoryItem.value}
                      onClick={() => setSelectedCategory(categoryItem.name)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 1,
                        border: selectedCategory === categoryItem.name ? '2px solid #1976d2' : '2px solid transparent',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backgroundColor: selectedCategory === categoryItem.name ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                        minWidth: '80px',
                        flexShrink: 0,
                        scrollSnapAlign: 'start',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.05)',
                          borderColor: '#1976d2',
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={categoryItem.image}
                        alt={categoryItem.name}
                        sx={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: 1,
                          marginBottom: 0.5,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          textAlign: 'center',
                          fontWeight: 500,
                          color: selectedCategory === categoryItem.name ? '#1976d2' : '#333',
                          fontSize: '0.65rem',
                          lineHeight: 1.2,
                          wordBreak: 'break-word',
                        }}
                      >
                        {categoryItem.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                // PC: 한 줄로 정렬된 카테고리
                <Box sx={{
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  {bikeCategories.map((categoryItem) => (
                    <Box
                      key={categoryItem.value}
                      onClick={() => setSelectedCategory(categoryItem.name)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 1.5,
                        border: selectedCategory === categoryItem.name ? '3px solid #1976d2' : '2px solid #e0e0e0',
                        borderRadius: 3,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backgroundColor: selectedCategory === categoryItem.name ? 'rgba(25, 118, 210, 0.08)' : 'white',
                        boxShadow: selectedCategory === categoryItem.name 
                          ? '0 4px 12px rgba(25, 118, 210, 0.2)' 
                          : '0 2px 8px rgba(0, 0, 0, 0.1)',
                        minWidth: '120px',
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
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: 2,
                          marginBottom: 1,
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          textAlign: 'center',
                          fontWeight: selectedCategory === categoryItem.name ? 600 : 500,
                          color: selectedCategory === categoryItem.name ? '#1976d2' : '#333',
                          fontSize: '0.85rem',
                          lineHeight: 1.3,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {categoryItem.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* 검색 조건 영역 - PC에서는 세로로, 모바일에서는 가로로 정렬 */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'row', md: 'column' },
              gap: { xs: 1, md: 2 },
              marginBottom: 2,
              flexWrap: { xs: 'wrap', md: 'nowrap' }
            }}>
              {/* 브랜드 */}
              <FormControl sx={{ 
                minWidth: { xs: 'calc(50% - 4px)', md: '100%' },
                flex: { xs: '1 1 calc(50% - 4px)', md: 'none' }
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

              {/* 키워드 */}
              <TextField
                label={t('Keyword')}
                placeholder={t('Search by model, year...')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                size={isMobile ? 'small' : 'medium'}
                sx={{ 
                  minWidth: { xs: 'calc(50% - 4px)', md: '100%' },
                  flex: { xs: '1 1 calc(50% - 4px)', md: 'none' }
                }}
              />

              {/* 위치 */}
              <FormControl sx={{ 
                minWidth: { xs: 'calc(50% - 4px)', md: '100%' },
                flex: { xs: '1 1 calc(50% - 4px)', md: 'none' }
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

              {/* 컨디션 */}
              <FormControl sx={{ 
                minWidth: { xs: 'calc(50% - 4px)', md: '100%' },
                flex: { xs: '1 1 calc(50% - 4px)', md: 'none' }
              }}>
                <InputLabel sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>{t('Condition')}</InputLabel>
                <Select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  label={t('Condition')}
                  size={isMobile ? 'small' : 'medium'}
                >
                  <MenuItem value="all">{t('All Conditions')}</MenuItem>
                  <MenuItem value="new">{t('New')}</MenuItem>
                  <MenuItem value="used">{t('Used')}</MenuItem>
                </Select>
              </FormControl>
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
              <Button
                variant="outlined"
                color="error"
                onClick={handleClearAll}
                sx={{ 
                  textTransform: 'none', 
                  height: { xs: '48px', md: '48px' },
                  minWidth: { xs: 'auto', md: '140px' },
                  fontSize: { xs: '1rem', md: '1rem' },
                  fontWeight: { xs: 500, md: 500 },
                  borderWidth: '2px',
                  flex: { xs: 0, md: 0 },
                  '&:hover': {
                    borderWidth: '2px',
                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {t('Clear all')}
              </Button>
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