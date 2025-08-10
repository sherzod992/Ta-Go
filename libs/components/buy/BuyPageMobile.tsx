import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
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
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
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
  Close as CloseIcon,
} from '@mui/icons-material';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import {
  PropertyType,
  PropertyLocation,
  FuelType,
  TransmissionType,
  ConditionType,
} from '../../enums/property.enum';

const BuyPageMobile: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  
  // 필터 상태
  const [filters, setFilters] = useState({
    keyword: '',
    brand: 'all',
    type: 'all',
    location: 'all',
    condition: 'all',
    priceRange: [0, 50000000],
    yearRange: [1990, new Date().getFullYear()],
    mileageRange: [0, 100000],
  });
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState('latest');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 검색 변수 생성
  const searchVariables = useMemo(() => {
    const search: any = {};

    if (filters.keyword) search.text = filters.keyword;
    if (filters.brand !== 'all') search.brandList = [filters.brand];
    if (filters.type !== 'all') {
      const typeMap: { [key: string]: PropertyType } = {
        'Adventure Tourers': PropertyType.ADVENTURE_TOURERS,
        'Agriculture': PropertyType.AGRICULTURE,
        'All Terrain Vehicles': PropertyType.ALL_TERRAIN_VEHICLES,
        'Dirt Bikes': PropertyType.DIRT,
        'Electric': PropertyType.ELECTRIC,
        'Enduro': PropertyType.ENDURO,
        'Mini Bikes': PropertyType.MINI_BIKES,
        'SxS/UTV': PropertyType.SXS_UTV
      };
      const selectedType = typeMap[filters.type];
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
        page: 1,
        limit: 50,
        search
      }
    };
  }, [filters]);

  // GraphQL 쿼리 실행
  const { data, loading, error } = useQuery(GET_PROPERTIES, {
    variables: searchVariables,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  const properties = data?.getProperties?.list || [];

  // 정렬된 매물 목록
  const sortedProperties = useMemo(() => {
    if (!properties || properties.length === 0) {
      return [];
    }
    
    const sorted = [...properties];
    
    console.log('Sorting properties:', { sortBy, propertiesCount: sorted.length });
    
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return `${mileage.toLocaleString()}km`;
  };

  return (
    <Box className="buy-page-mobile" sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="sm" sx={{ py: 2 }}>
        {/* 헤더 */}
        <Paper className="header-section" sx={{ p: 3, mb: 2, textAlign: 'center' }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {t('Buy Motorcycles')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('Find your perfect motorcycle')}
          </Typography>
        </Paper>

        {/* 검색 및 필터 */}
        <Paper className="search-section" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={9}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('Search motorcycles...')}
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setFilterDrawerOpen(true)}
                startIcon={<FilterIcon />}
              >
                {t('Filter')}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* 정렬 및 뷰 모드 */}
        <Paper className="controls-section" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
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
            <Grid item xs={6}>
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
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t('Failed to load properties. Please try again later.')}
            </Alert>
          ) : properties.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('No properties found matching your criteria.')}
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {sortedProperties.map((property: any) => (
                <Grid item xs={viewMode === 'grid' ? 6 : 12} key={property._id}>
                  <Card 
                    className="property-card"
                    onClick={() => handlePropertyClick(property._id)}
                    sx={{ 
                      cursor: 'pointer',
                      display: viewMode === 'list' ? 'flex' : 'block',
                      flexDirection: viewMode === 'list' ? 'row' : 'column',
                      height: viewMode === 'list' ? '120px' : 'auto',
                      overflow: 'hidden'
                    }}
                  >
                    <CardMedia
                      component="img"
                      height={viewMode === 'list' ? '120px' : '200'}
                      width={viewMode === 'list' ? '120px' : 'auto'}
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
                      justifyContent: 'space-between',
                      p: viewMode === 'list' ? 2 : 3,
                      minHeight: viewMode === 'list' ? '120px' : 'auto'
                    }}>
                      {viewMode === 'list' ? (
                        // 리스트 모드 레이아웃
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          height: '100%',
                          justifyContent: 'space-between'
                        }}>
                          {/* 제목과 즐겨찾기 버튼 */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography 
                              variant="h6" 
                              component="h3" 
                              sx={{ 
                                flex: 1,
                                fontSize: '1rem',
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
                              sx={{ ml: 1, flexShrink: 0 }}
                            >
                              {favorites.has(property._id) ? (
                                <FavoriteIcon color="error" />
                              ) : (
                                <FavoriteBorderIcon />
                              )}
                            </IconButton>
                          </Box>

                          {/* 상세 정보 */}
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: 0.5,
                            flex: 1
                          }}>
                            {/* 브랜드와 모델 */}
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {property.propertyBrand} {property.propertyModel}
                            </Typography>
                            
                            {/* 연식과 주행거리 */}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <YearIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {property.propertyYear}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <SpeedIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {formatMileage(property.propertyMileage)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          {/* 가격 */}
                          <Box sx={{ mt: 'auto', pt: 1 }}>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
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
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                            <Chip label={property.propertyBrand} size="small" />
                            <Chip label={property.propertyYear} size="small" />
                            <Chip label={formatMileage(property.propertyMileage)} size="small" />
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {property.propertyLocation}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {property.propertyDesc}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      {/* 필터 드로어 */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{t('Filters')}</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <List>
            <ListItem>
              <FormControl fullWidth>
                <InputLabel>{t('Brand')}</InputLabel>
                <Select
                  value={filters.brand}
                  label={t('Brand')}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                >
                  <MenuItem value="all">{t('All brands')}</MenuItem>
                  <MenuItem value="Honda">Honda</MenuItem>
                  <MenuItem value="Yamaha">Yamaha</MenuItem>
                  <MenuItem value="Suzuki">Suzuki</MenuItem>
                  <MenuItem value="Kawasaki">Kawasaki</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            
            <ListItem>
              <FormControl fullWidth>
                <InputLabel>{t('Category')}</InputLabel>
                <Select
                  value={filters.type}
                  label={t('Category')}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <MenuItem value="all">{t('All categories')}</MenuItem>
                  <MenuItem value="Adventure Tourers">{t('Adventure Tourers')}</MenuItem>
                  <MenuItem value="Agriculture">{t('Agriculture')}</MenuItem>
                  <MenuItem value="All Terrain Vehicles">{t('All Terrain Vehicles')}</MenuItem>
                  <MenuItem value="Dirt Bikes">{t('Dirt Bikes')}</MenuItem>
                  <MenuItem value="Electric">{t('Electric')}</MenuItem>
                  <MenuItem value="Enduro">{t('Enduro')}</MenuItem>
                  <MenuItem value="Mini Bikes">{t('Mini Bikes')}</MenuItem>
                  <MenuItem value="SxS/UTV">{t('SxS/UTV')}</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            
            <ListItem>
              <FormControl fullWidth>
                <InputLabel>{t('Location')}</InputLabel>
                <Select
                  value={filters.location}
                  label={t('Location')}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                >
                  <MenuItem value="all">{t('All locations')}</MenuItem>
                  <MenuItem value="seoul">Seoul</MenuItem>
                  <MenuItem value="busan">Busan</MenuItem>
                  <MenuItem value="daegu">Daegu</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            
            <ListItem>
              <Typography gutterBottom>{t('Price Range')}</Typography>
              <Slider
                value={filters.priceRange}
                onChange={(_, value) => setFilters({ ...filters, priceRange: value as number[] })}
                valueLabelDisplay="auto"
                min={0}
                max={50000000}
                step={1000000}
                valueLabelFormat={(value) => formatPrice(value)}
              />
            </ListItem>
          </List>
          
          <Box sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
            >
              {t('Apply Filters')}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default BuyPageMobile;
