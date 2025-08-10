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
  CircularProgress
} from '@mui/material';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { PropertyLocation, PropertyType, PropertyStatus, ConditionType } from '../../enums/property.enum';

const HeroSection: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [make, setMake] = useState('all');
  const [model, setModel] = useState('all');
  const [category, setCategory] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('all');
  const [condition, setCondition] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

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

  // 검색 필터 변수 생성
  const searchVariables = useMemo(() => {
    const search: any = {};

    if (make !== 'all') search.brandList = [make];
    if (category !== 'all') {
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
      const selectedCategory = categoryMap[category];
      if (selectedCategory) {
        search.typeList = [selectedCategory];
      }
    }
    if (keyword) search.text = keyword;
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
      const conditionMap: { [key: string]: ConditionType } = {
        'new': ConditionType.EXCELLENT,
        'used': ConditionType.GOOD
      };
      search.options = [conditionMap[condition]];
    }
    if (priceMin || priceMax) {
      search.pricesRange = {
        start: priceMin ? parseInt(priceMin) : 0,
        end: priceMax ? parseInt(priceMax) : 50000000
      };
    }

    return {
      input: {
        page: 1,
        limit: 1000, // 충분히 큰 수로 설정하여 모든 결과를 가져옴
        search
      }
    };
  }, [make, model, category, keyword, location, condition, priceMin, priceMax]);

  // GraphQL 쿼리 실행
  const { data, loading, error } = useQuery(GET_PROPERTIES, {
    variables: searchVariables,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  // 검색 결과 개수
  const searchResultCount = data?.getProperties?.list?.length || 0;

  const handleClearAll = () => {
    setMake('all');
    setModel('all');
    setCategory('all');
    setKeyword('');
    setLocation('all');
    setCondition('all');
    setPriceMin('');
    setPriceMax('');
  };

  const handleShowBikes = () => {
    if (searchResultCount > 0) {
      // 검색 결과가 있을 때만 페이지 이동
      const queryParams = new URLSearchParams();
      if (make !== 'all') queryParams.append('make', make);
      if (model !== 'all') queryParams.append('model', model);
      if (category !== 'all') queryParams.append('category', category);
      if (keyword) queryParams.append('keyword', keyword);
      if (location !== 'all') queryParams.append('location', location);
      if (condition !== 'all') queryParams.append('condition', condition);
      if (priceMin) queryParams.append('priceMin', priceMin);
      if (priceMax) queryParams.append('priceMax', priceMax);
      
      router.push(`/property?${queryParams.toString()}`);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '800px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Image - Full Size */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/img/home/home1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
          }
        }}
      />
      
      {/* Hero Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            textAlign: 'center',
            color: 'white',
            pt: 8,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '3rem', md: '5rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              marginBottom: 2,
            }}
          >
            {t('Find your next bike')}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              marginBottom: 4,
            }}
          >
            {t('Discover the perfect ride for your adventure')}
          </Typography>
        </Box>
      </Container>

      {/* Search Filter Card - Positioned at Bottom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          pb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              marginBottom: 2,
            }}
          >
            <CardContent sx={{ padding: 3 }}>
              <Typography
                variant="h3"
                sx={{
                  textAlign: 'center',
                  marginBottom: 3,
                  fontWeight: 'bold',
                  color: '#333',
                }}
              >
                {t('Search Filters')}
              </Typography>
              
              {/* Top Row Filters */}
              <Grid container spacing={2} sx={{ marginBottom: 2 }}>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('Make')}</InputLabel>
                    <Select
                      value={make}
                      label={t('Make')}
                      onChange={(e) => setMake(e.target.value)}
                    >
                      <MenuItem value="all">{t('All makes')}</MenuItem>
                      <MenuItem value="honda">Honda</MenuItem>
                      <MenuItem value="yamaha">Yamaha</MenuItem>
                      <MenuItem value="kawasaki">Kawasaki</MenuItem>
                      <MenuItem value="suzuki">Suzuki</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('Model')}</InputLabel>
                    <Select
                      value={model}
                      label={t('Model')}
                      onChange={(e) => setModel(e.target.value)}
                      disabled={make === 'all'}
                    >
                      <MenuItem value="all">{t('All models')}</MenuItem>
                      <MenuItem value="cbr">CBR</MenuItem>
                      <MenuItem value="cb">CB</MenuItem>
                      <MenuItem value="vfr">VFR</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('Category')}</InputLabel>
                    <Select
                      value={category}
                      label={t('Category')}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <MenuItem value="all">{t('All categories')}</MenuItem>
                      <MenuItem value="sport">Sport</MenuItem>
                      <MenuItem value="cruiser">Cruiser</MenuItem>
                      <MenuItem value="touring">Touring</MenuItem>
                      <MenuItem value="dirt">Dirt</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('Keyword')}
                    placeholder={t('Search by keyword')}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={searchResultCount === 0}
                    onClick={handleShowBikes}
                    sx={{
                      height: '40px',
                      backgroundColor: searchResultCount === 0 ? 'rgba(0, 0, 0, 0.12)' : '#d32f2f',
                      color: searchResultCount === 0 ? 'rgba(0, 0, 0, 0.26)' : 'white',
                      '&:hover': { 
                        backgroundColor: searchResultCount === 0 ? 'rgba(0, 0, 0, 0.12)' : '#b71c1c' 
                      },
                      '&:disabled': {
                        backgroundColor: 'rgba(0, 0, 0, 0.12)',
                        color: 'rgba(0, 0, 0, 0.26)'
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      `${t('Show bikes')} (${searchResultCount})`
                    )}
                  </Button>
                </Grid>
              </Grid>

              {/* 검색 결과 안내 */}
              {!loading && searchResultCount === 0 && (
                <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 1, border: '1px solid #ffc107' }}>
                  <Typography variant="body2" color="warning.main">
                    {t('No bikes found')} - {t('Try adjusting your search criteria')}
                  </Typography>
                </Box>
              )}

              {/* Bottom Row Filters */}
              <Grid container spacing={2} sx={{ marginBottom: 2 }}>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('Location')}</InputLabel>
                    <Select
                      value={location}
                      label={t('Location')}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <MenuItem value="all">{t('All locations')}</MenuItem>
                      <MenuItem value="seoul">Seoul</MenuItem>
                      <MenuItem value="busan">Busan</MenuItem>
                      <MenuItem value="daegu">Daegu</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('New and used')}</InputLabel>
                    <Select
                      value={condition}
                      label={t('New and used')}
                      onChange={(e) => setCondition(e.target.value)}
                    >
                      <MenuItem value="all">{t('Any')}</MenuItem>
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="used">Used</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('Price min')}</InputLabel>
                    <Select
                      value={priceMin}
                      label={t('Price min')}
                      onChange={(e) => setPriceMin(e.target.value)}
                    >
                      <MenuItem value="">{t('Any')}</MenuItem>
                      <MenuItem value="1000">$1,000</MenuItem>
                      <MenuItem value="5000">$5,000</MenuItem>
                      <MenuItem value="10000">$10,000</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('Price max')}</InputLabel>
                    <Select
                      value={priceMax}
                      label={t('Price max')}
                      onChange={(e) => setPriceMax(e.target.value)}
                    >
                      <MenuItem value="">{t('Any')}</MenuItem>
                      <MenuItem value="5000">$5,000</MenuItem>
                      <MenuItem value="10000">$10,000</MenuItem>
                      <MenuItem value="20000">$20,000</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="text"
                    color="error"
                    onClick={handleClearAll}
                    sx={{ textTransform: 'none' }}
                  >
                    {t('Clear all')}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Bike Categories */}
          <Paper
            sx={{
              padding: 3,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Grid container spacing={2}>
              {bikeCategories.map((categoryItem) => (
                <Grid item xs={6} sm={4} md={3} lg={1.7} key={categoryItem.name}>
                  <Box
                    onClick={() => {
                      setCategory(categoryItem.name);
                      // 카테고리 선택 시 자동으로 검색 결과 확인
                    }}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      backgroundColor: category === categoryItem.name ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                      border: category === categoryItem.name ? '2px solid #1976d2' : '2px solid transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={categoryItem.image}
                      alt={categoryItem.name}
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: 'contain',
                        marginBottom: 1,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        textAlign: 'center',
                        fontWeight: 500,
                        color: category === categoryItem.name ? '#1976d2' : '#333',
                      }}
                    >
                      {categoryItem.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default HeroSection; 