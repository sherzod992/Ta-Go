import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  IconButton,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  Speed as SpeedIcon,
  CalendarToday as YearIcon,
  DirectionsBike as BikeIcon,
  ExpandMore as ExpandMoreIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Compare as CompareIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import {
  PropertyType,
  PropertyLocation,
  FuelType,
  TransmissionType,
  ConditionType,
} from '../../enums/property.enum';

const BuyPageDesktop: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  
  // 필터 상태
  const [filters, setFilters] = useState({
    keyword: '',
    brand: 'all',
    location: 'all',
    condition: 'all',
    fuelType: 'all',
    transmission: 'all',
    priceRange: [0, 50000000],
    yearRange: [1990, new Date().getFullYear()],
    mileageRange: [0, 100000],
    engineSizeRange: [50, 2000],
  });
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
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 검색 변수 생성
  const searchVariables = useMemo(() => {
    const search: any = {};

    if (filters.keyword) search.text = filters.keyword;
    if (filters.brand !== 'all') search.brandList = [filters.brand];
    if (selectedCategory !== 'all') {
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
    if (filters.location !== 'all') {
      const locationMap: { [key: string]: PropertyLocation } = {
        'seoul': PropertyLocation.SEOUL,
        'busan': PropertyLocation.BUSAN,
        'daegu': PropertyLocation.DAEGU
      };
      search.locationList = [locationMap[filters.location]];
    }
    if (filters.condition !== 'all') {
      const conditionMap: { [key: string]: ConditionType } = {
        'new': ConditionType.EXCELLENT,
        'used': ConditionType.GOOD
      };
      search.options = [conditionMap[filters.condition]];
    }
    if (filters.fuelType !== 'all') {
      const fuelMap: { [key: string]: FuelType } = {
        'gasoline': FuelType.GASOLINE,
        'electric': FuelType.ELECTRIC,
        'hybrid': FuelType.HYBRID
      };
      // fuelType은 options에 추가
      if (!search.options) search.options = [];
      search.options.push(fuelMap[filters.fuelType]);
    }
    if (filters.transmission !== 'all') {
      const transmissionMap: { [key: string]: TransmissionType } = {
        'manual': TransmissionType.MANUAL,
        'automatic': TransmissionType.AUTOMATIC,
        'cvt': TransmissionType.CVT
      };
      // transmission도 options에 추가
      if (!search.options) search.options = [];
      search.options.push(transmissionMap[filters.transmission]);
    }
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000000) {
      search.pricesRange = {
        start: filters.priceRange[0],
        end: filters.priceRange[1]
      };
    }
    if (filters.yearRange[0] > 1990 || filters.yearRange[1] < new Date().getFullYear()) {
      search.yearRange = {
        start: filters.yearRange[0],
        end: filters.yearRange[1]
      };
    }
    if (filters.mileageRange[0] > 0 || filters.mileageRange[1] < 100000) {
      search.mileageRange = {
        start: filters.mileageRange[0],
        end: filters.mileageRange[1]
      };
    }

    return {
      input: {
        page,
        limit: 12,
        search
      }
    };
  }, [filters, selectedCategory, page]);

  // GraphQL 쿼리 실행
  const { data, loading, error } = useQuery(GET_PROPERTIES, {
    variables: searchVariables,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  const properties = data?.getProperties?.list || [];
  const totalCount = data?.getProperties?.metaCounter?.[0]?.total || 0;
  const totalPages = Math.ceil(totalCount / 12);

  // 정렬된 매물 목록
  const sortedProperties = useMemo(() => {
    if (!properties || properties.length === 0) {
      return [];
    }
    
    const sorted = [...properties];
    
    try {
      switch (sortBy) {
        case 'price-low':
          return sorted.sort((a, b) => {
            const priceA = Number(a.propertyPrice) || 0;
            const priceB = Number(b.propertyPrice) || 0;
            return priceA - priceB;
          });
        case 'price-high':
          return sorted.sort((a, b) => {
            const priceA = Number(a.propertyPrice) || 0;
            const priceB = Number(b.propertyPrice) || 0;
            return priceB - priceA;
          });
        case 'year':
          return sorted.sort((a, b) => {
            const yearA = Number(a.propertyYear) || 0;
            const yearB = Number(b.propertyYear) || 0;
            return yearB - yearA;
          });
        case 'mileage':
          return sorted.sort((a, b) => {
            const mileageA = Number(a.propertyMileage) || 0;
            const mileageB = Number(b.propertyMileage) || 0;
            return mileageA - mileageB;
          });
        case 'latest':
        default:
          return sorted.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
      }
    } catch (error) {
      console.error('Error sorting properties:', error);
      return sorted;
    }
  }, [properties, sortBy]);

  const handleFavoriteToggle = (propertyId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(propertyId)) {
      newFavorites.delete(propertyId);
    } else {
      newFavorites.add(propertyId);
    }
    setFavorites(newFavorites);
  };

  const handlePropertyClick = (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  };

  const handleClearFilters = () => {
    setFilters({
      keyword: '',
      brand: 'all',
      location: 'all',
      condition: 'all',
      fuelType: 'all',
      transmission: 'all',
      priceRange: [0, 50000000],
      yearRange: [1990, new Date().getFullYear()],
      mileageRange: [0, 100000],
      engineSizeRange: [50, 2000],
    });
    setSelectedCategory('all');
    setPage(1);
  };

  const formatMileage = (mileage: number) => {
    return `${mileage.toLocaleString()}km`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('Buy Motorcycles')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('Find your perfect motorcycle from thousands of listings')}
        </Typography>
      </Box>

      {/* 검색 및 필터 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder={t('Search by title, brand, model')}
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>브랜드</InputLabel>
              <Select
                value={filters.brand}
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                label="브랜드"
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="honda">Honda</MenuItem>
                <MenuItem value="yamaha">Yamaha</MenuItem>
                <MenuItem value="suzuki">Suzuki</MenuItem>
                <MenuItem value="kawasaki">Kawasaki</MenuItem>
                <MenuItem value="bmw">BMW</MenuItem>
                <MenuItem value="ducati">Ducati</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>지역</InputLabel>
              <Select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                label="지역"
              >
                <MenuItem value="all">전체</MenuItem>
                {Object.values(PropertyLocation).map((location) => (
                  <MenuItem key={location} value={location}>{location}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>상태</InputLabel>
              <Select
                value={filters.condition}
                onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                label="상태"
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="new">신차</MenuItem>
                <MenuItem value="used">중고</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                fullWidth
              >
                필터
              </Button>
              <Button
                variant="outlined"
                startIcon={<ViewModuleIcon />}
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 바이크 카테고리 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('Bike Categories')}
        </Typography>
        <Grid container spacing={1}>
          {bikeCategories.map((category) => (
            <Grid item xs={3} sm={1.5} key={category.value}>
              <Box
                onClick={() => setSelectedCategory(selectedCategory === category.name ? 'all' : category.name)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 1,
                  border: selectedCategory === category.name ? '2px solid #1976d2' : '2px solid transparent',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: selectedCategory === category.name ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                    borderColor: '#1976d2',
                  },
                }}
              >
                <Box
                  component="img"
                  src={category.image}
                  alt={category.name}
                  sx={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: 1,
                    marginBottom: 0.5,
                    aspectRatio: '1/1',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    textAlign: 'center',
                    fontWeight: 500,
                    color: selectedCategory === category.name ? '#1976d2' : '#333',
                    fontSize: '0.7rem',
                    lineHeight: 1.2,
                  }}
                >
                  {category.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 매물 목록 */}
      <Grid container spacing={3}>
        {/* 정렬 및 뷰 모드 */}
        <Grid item xs={12} md={3}>
          <Paper className="sidebar-filters" sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                <FilterIcon sx={{ mr: 1 }} />
                {t('Filters')}
              </Typography>
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                {t('Clear')}
              </Button>
            </Box>

            {/* 브랜드 */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('Brand')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.brand}
                    onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                  >
                    <MenuItem value="all">{t('All brands')}</MenuItem>
                    <MenuItem value="Honda">Honda</MenuItem>
                    <MenuItem value="Yamaha">Yamaha</MenuItem>
                    <MenuItem value="Suzuki">Suzuki</MenuItem>
                    <MenuItem value="Kawasaki">Kawasaki</MenuItem>
                    <MenuItem value="BMW">BMW</MenuItem>
                    <MenuItem value="Ducati">Ducati</MenuItem>
                    <MenuItem value="KTM">KTM</MenuItem>
                    <MenuItem value="Harley-Davidson">Harley-Davidson</MenuItem>
                    <MenuItem value="Triumph">Triumph</MenuItem>
                    <MenuItem value="Aprilia">Aprilia</MenuItem>
                    <MenuItem value="Moto Guzzi">Moto Guzzi</MenuItem>
                    <MenuItem value="MV Agusta">MV Agusta</MenuItem>
                    <MenuItem value="Royal Enfield">Royal Enfield</MenuItem>
                    <MenuItem value="Zero">Zero</MenuItem>
                    <MenuItem value="Hero">Hero</MenuItem>
                    <MenuItem value="TVS">TVS</MenuItem>
                    <MenuItem value="Bajaj">Bajaj</MenuItem>
                    <MenuItem value="other">{t('Other')}</MenuItem>
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* 오토바이 타입 */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('Motorcycle Types')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {bikeCategories.map((categoryItem) => (
                    <Grid item xs={6} key={categoryItem.name}>
                      <Box
                        onClick={() => {
                          setSelectedCategory(selectedCategory === categoryItem.name ? 'all' : categoryItem.name);
                        }}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                          padding: 1,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          backgroundColor: selectedCategory === categoryItem.name ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                          border: selectedCategory === categoryItem.name ? '2px solid #1976d2' : '2px solid transparent',
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
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: 1,
                            marginBottom: 0.5,
                            aspectRatio: '1/1',
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            textAlign: 'center',
                            fontWeight: 500,
                            color: selectedCategory === categoryItem.name ? '#1976d2' : '#333',
                            fontSize: '0.7rem',
                            lineHeight: 1.2,
                          }}
                        >
                          {categoryItem.name}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* 위치 */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('Location')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  >
                    <MenuItem value="all">{t('All locations')}</MenuItem>
                    <MenuItem value="seoul">Seoul</MenuItem>
                    <MenuItem value="busan">Busan</MenuItem>
                    <MenuItem value="daegu">Daegu</MenuItem>
                    <MenuItem value="incheon">Incheon</MenuItem>
                    <MenuItem value="daejeon">Daejeon</MenuItem>
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* 가격 범위 */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('Price Range')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Slider
                  value={filters.priceRange}
                  onChange={(_, value) => setFilters({ ...filters, priceRange: value as number[] })}
                  valueLabelDisplay="auto"
                  min={0}
                  max={50000000}
                  step={1000000}
                  valueLabelFormat={(value) => formatPrice(value)}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption">{formatPrice(filters.priceRange[0])}</Typography>
                  <Typography variant="caption">{formatPrice(filters.priceRange[1])}</Typography>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* 연료 타입 */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('Fuel Type')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.fuelType}
                    onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                  >
                    <MenuItem value="all">{t('All fuel types')}</MenuItem>
                    <MenuItem value="gasoline">{t('Gasoline')}</MenuItem>
                    <MenuItem value="electric">{t('Electric')}</MenuItem>
                    <MenuItem value="hybrid">{t('Hybrid')}</MenuItem>
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* 변속기 */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('Transmission')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.transmission}
                    onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                  >
                    <MenuItem value="all">{t('All transmissions')}</MenuItem>
                    <MenuItem value="manual">{t('Manual')}</MenuItem>
                    <MenuItem value="automatic">{t('Automatic')}</MenuItem>
                    <MenuItem value="cvt">{t('CVT')}</MenuItem>
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>

        {/* 메인 콘텐츠 */}
        <Grid item xs={12} md={9}>
          {/* 정렬 및 뷰 모드 */}
          <Paper className="controls-section" sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('Showing')} {properties.length} {t('of')} {totalCount} {t('properties')}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('Sort by')}</InputLabel>
                  <Select
                    value={sortBy}
                    label={t('Sort by')}
                    onChange={(e) => {
                      console.log('Sort changed to:', e.target.value);
                      setSortBy(e.target.value);
                    }}
                  >
                    <MenuItem value="latest">{t('Latest')}</MenuItem>
                    <MenuItem value="price-low">{t('Price: Low to High')}</MenuItem>
                    <MenuItem value="price-high">{t('Price: High to Low')}</MenuItem>
                    <MenuItem value="year">{t('Year')}</MenuItem>
                    <MenuItem value="mileage">{t('Mileage')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton
                    onClick={() => setViewMode('list')}
                    color={viewMode === 'list' ? 'primary' : 'default'}
                  >
                    <ViewListIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setViewMode('grid')}
                    color={viewMode === 'grid' ? 'primary' : 'default'}
                  >
                    <ViewModuleIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* 매물 목록 */}
          <Box className="properties-section">
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={60} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {t('Failed to load properties. Please try again later.')}
              </Alert>
            ) : properties.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                {t('No properties found matching your criteria.')}
              </Alert>
            ) : (
              <>
                <Grid container spacing={3}>
                  {sortedProperties.map((property: any) => (
                    <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} lg={viewMode === 'grid' ? 4 : 12} key={property._id}>
                      <Card 
                        className="property-card"
                        onClick={() => handlePropertyClick(property._id)}
                        sx={{ 
                          cursor: 'pointer',
                          height: viewMode === 'list' ? 'auto' : '100%',
                          display: 'flex',
                          flexDirection: viewMode === 'list' ? 'row' : 'column',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          height={viewMode === 'list' ? '160px' : '250'}
                          width={viewMode === 'list' ? '200px' : 'auto'}
                          image={property.propertyImages?.[0] || '/img/typeImages/type1.png'}
                          alt={property.propertyTitle}
                          sx={{ 
                            objectFit: 'cover',
                            flexShrink: 0,
                            borderRadius: viewMode === 'list' ? '8px 0 0 8px' : '8px 8px 0 0'
                          }}
                        />
                        <CardContent sx={{ 
                          flex: viewMode === 'list' ? 1 : 'none',
                          display: 'flex', 
                          flexDirection: 'column',
                          p: viewMode === 'list' ? 3 : 3,
                          minHeight: viewMode === 'list' ? 'auto' : 'auto'
                        }}>
                          {viewMode === 'list' ? (
                            // 리스트 모드 레이아웃
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              justifyContent: 'space-between',
                              gap: 2
                            }}>
                              {/* 제목과 즐겨찾기 버튼 */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography 
                                  variant="h5" 
                                  component="h3" 
                                  sx={{ 
                                    flex: 1,
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}
                                >
                                  {property.propertyTitle}
                                </Typography>
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFavoriteToggle(property._id);
                                  }}
                                  size="small"
                                  sx={{ ml: 2, flexShrink: 0 }}
                                >
                                  {favorites.has(property._id) ? (
                                    <FavoriteIcon color="error" />
                                  ) : (
                                    <FavoriteBorderIcon />
                                  )}
                                </IconButton>
                              </Box>

                              {/* 브랜드와 모델 */}
                              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {property.propertyBrand} {property.propertyModel}
                              </Typography>
                              
                              {/* 연식, 주행거리, 위치 */}
                              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <YearIcon sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {property.propertyYear}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <SpeedIcon sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {formatMileage(property.propertyMileage)}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LocationIcon sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {property.propertyLocation}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* 설명 */}
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  flexGrow: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {property.propertyDesc}
                              </Typography>

                              {/* 가격 */}
                              <Box sx={{ mt: 'auto' }}>
                                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                  {formatPrice(property.propertyPrice)}
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            // 그리드 모드 레이아웃 (기존)
                            <>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography 
                                  variant="h6" 
                                  component="h3" 
                                  noWrap
                                  sx={{ flex: 1 }}
                                >
                                  {property.propertyTitle}
                                </Typography>
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFavoriteToggle(property._id);
                                  }}
                                  size="small"
                                >
                                  {favorites.has(property._id) ? (
                                    <FavoriteIcon color="error" />
                                  ) : (
                                    <FavoriteBorderIcon />
                                  )}
                                </IconButton>
                              </Box>
                              
                              <Typography variant="h5" color="primary" gutterBottom>
                                {formatPrice(property.propertyPrice)}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                <Chip label={property.propertyBrand} size="small" />
                                <Chip label={property.propertyYear} size="small" />
                                <Chip label={formatMileage(property.propertyMileage)} size="small" />
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <LocationIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {property.propertyLocation}
                                </Typography>
                              </Box>
                              
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  flexGrow: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {property.propertyDesc}
                              </Typography>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      color="primary"
                      size="large"
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BuyPageDesktop;
