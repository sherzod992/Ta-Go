import React, { useState, useMemo } from 'react';
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
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Divider,
  Alert,
  Skeleton,
  Collapse,
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
} from '@mui/icons-material';
import {
  PropertyType,
  PropertyLocation,
  FuelType,
  TransmissionType,
  PropertyCondition,
} from '../../enums/property.enum';

// 하드코드된 매물 데이터
const mockProperties = [
  {
    id: 1,
    title: '2022 Honda CBR1000RR-R Fireblade',
    price: 25000000,
    year: 2022,
    mileage: 5000,
    location: PropertyLocation.SEOUL,
    type: PropertyType.ADVENTURE_TOURERS,
    fuelType: FuelType.GASOLINE,
    transmission: TransmissionType.MANUAL,
    condition: PropertyCondition.EXCELLENT,
    brand: 'Honda',
    model: 'CBR1000RR-R Fireblade',
    color: '빨강',
    description: '최신 모델의 파이어블레이드입니다. 완벽한 상태로 보관되어 있으며, 레이싱 성능을 자랑합니다.',
    images: ['/img/logo/Honda_Logo.svg'],
    rating: 4.8,
    isFavorite: false,
    contact: '010-1234-5678',
    seller: '김바이커',
    features: ['ABS', '트랙션 컨트롤', '파워 모드', '퀵 시프터'],
  },
  {
    id: 2,
    title: '2021 Yamaha YZF-R1',
    price: 22000000,
    year: 2021,
    mileage: 8000,
    location: PropertyLocation.BUSAN,
    type: PropertyType.ADVENTURE_TOURERS,
    fuelType: FuelType.GASOLINE,
    transmission: TransmissionType.MANUAL,
    condition: PropertyCondition.GOOD,
    brand: 'Yamaha',
    model: 'YZF-R1',
    color: '파랑',
    description: '야마하의 플래그십 스포츠바이크입니다. 강력한 엔진과 정밀한 핸들링을 제공합니다.',
    images: ['/img/logo/yamaha.webp'],
    rating: 4.6,
    isFavorite: true,
    contact: '010-2345-6789',
    seller: '이스피드',
    features: ['ABS', '슬라이드 컨트롤', '런치 컨트롤', 'LED 헤드라이트'],
  },
  {
    id: 3,
    title: '2023 BMW R 1250 GS Adventure',
    price: 35000000,
    year: 2023,
    mileage: 3000,
    location: PropertyLocation.GYEONGGI,
    type: PropertyType.ADVENTURE_TOURERS,
    fuelType: FuelType.GASOLINE,
    transmission: TransmissionType.MANUAL,
    condition: PropertyCondition.EXCELLENT,
    brand: 'BMW',
    model: 'R 1250 GS Adventure',
    color: '검정',
    description: 'BMW의 대표적인 어드벤처 투어러입니다. 모든 지형을 정복할 수 있는 강력한 성능을 자랑합니다.',
    images: ['/img/logo/BMWMotorrad.jpg'],
    rating: 4.9,
    isFavorite: false,
    contact: '010-3456-7890',
    seller: '박어드벤처',
    features: ['ABS', '트랙션 컨트롤', '크루즈 컨트롤', '전자 서스펜션'],
  },
  {
    id: 4,
    title: '2020 Ducati Panigale V4',
    price: 40000000,
    year: 2020,
    mileage: 12000,
    location: PropertyLocation.DAEGU,
    type: PropertyType.ADVENTURE_TOURERS,
    fuelType: FuelType.GASOLINE,
    transmission: TransmissionType.MANUAL,
    condition: PropertyCondition.GOOD,
    brand: 'Ducati',
    model: 'Panigale V4',
    color: '빨강',
    description: '이탈리아의 열정이 담긴 듀카티 파니갈레 V4입니다. 레이싱 DNA가 깃든 최고급 스포츠바이크입니다.',
    images: ['/img/logo/Ducati.webp'],
    rating: 4.7,
    isFavorite: true,
    contact: '010-4567-8901',
    seller: '최듀카티',
    features: ['ABS', '트랙션 컨트롤', '휠리 컨트롤', '파워 런치'],
  },
  {
    id: 5,
    title: '2023 Zero SR/F Electric',
    price: 28000000,
    year: 2023,
    mileage: 2000,
    location: PropertyLocation.SEOUL,
    type: PropertyType.ELECTRIC,
    fuelType: FuelType.ELECTRIC,
    transmission: TransmissionType.AUTOMATIC,
    condition: PropertyCondition.EXCELLENT,
    brand: 'Zero',
    model: 'SR/F',
    color: '흰색',
    description: '미래지향적인 전기 오토바이입니다. 조용하고 깨끗하면서도 강력한 성능을 제공합니다.',
    images: ['/img/typeany/electric.png'],
    rating: 4.5,
    isFavorite: false,
    contact: '010-5678-9012',
    seller: '정전기',
    features: ['배터리 관리 시스템', '충전 포트', '스마트폰 연동', 'LED 조명'],
  },
  {
    id: 6,
    title: '2021 KTM 390 Duke',
    price: 8500000,
    year: 2021,
    mileage: 15000,
    location: PropertyLocation.INCHEON,
    type: PropertyType.ADVENTURE_TOURERS,
    fuelType: FuelType.GASOLINE,
    transmission: TransmissionType.MANUAL,
    condition: PropertyCondition.FAIR,
    brand: 'KTM',
    model: '390 Duke',
    color: '주황',
    description: 'KTM의 인기 모델 390 Duke입니다. 가벼운 무게와 민첩한 핸들링으로 도시 주행에 최적화되어 있습니다.',
    images: ['/img/logo/kTm.jpeg'],
    rating: 4.3,
    isFavorite: false,
    contact: '010-6789-0123',
    seller: '한케이티엠',
    features: ['ABS', 'LED 헤드라이트', '디지털 계기판', '슬리퍼 클러치'],
  },
];

// 브랜드 로고 매핑
const brandLogos = {
  'Honda': '/img/logo/Honda_Logo.svg',
  'Yamaha': '/img/logo/yamaha.webp',
  'Suzuki': '/img/logo/suzuki.jpg',
  'Kawasaki': '/img/logo/kTm.jpeg',
  'BMW': '/img/logo/BMWMotorrad.jpg',
  'Ducati': '/img/logo/Ducati.webp',
  'Harley-Davidson': '/img/logo/PWcsAzP2m-HarleyDavidson.svg',
  'KTM': '/img/logo/kTm.jpeg',
  'Aprilia': '/img/logo/BAprilia.jpg',
  'MV Agusta': '/img/logo/MVAgusta.jpg',
  'Moto Guzzi': '/img/logo/MotoGuzzi.png',
  'Royal Enfield': '/img/logo/royalenfield.jpeg',
  'Bajaj': '/img/logo/Bajaj-logo.jpg',
  'TVS': '/img/logo/TVS Motor.png',
  'Hero': '/img/logo/Hero_MotoCorp.png',
  'Zero': '/img/typeany/electric.png',
};

const PropertyBuyList: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [yearRange, setYearRange] = useState<[number, number]>([2010, 2024]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // 필터링된 매물 목록
  const filteredProperties = useMemo(() => {
    let filtered = Array.isArray(mockProperties) ? [...mockProperties] : []; // 배열을 안전하게 복사

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 타입 필터링
    if (selectedType) {
      filtered = filtered.filter(property => property.type === selectedType);
    }

    // 지역 필터링
    if (selectedLocation) {
      filtered = filtered.filter(property => property.location === selectedLocation);
    }

    // 브랜드 필터링
    if (selectedBrand) {
      filtered = filtered.filter(property => property.brand === selectedBrand);
    }

    // 가격 범위 필터링
    filtered = filtered.filter(property =>
      property.price >= priceRange[0] && property.price <= priceRange[1]
    );

    // 연식 범위 필터링
    filtered = filtered.filter(property =>
      property.year >= yearRange[0] && property.year <= yearRange[1]
    );

    // 정렬 (안전한 배열 복사 후 정렬)
    const sortedFiltered = [...filtered];
    switch (sortBy) {
      case 'price-low':
        sortedFiltered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sortedFiltered.sort((a, b) => b.price - a.price);
        break;
      case 'year-new':
        sortedFiltered.sort((a, b) => b.year - a.year);
        break;
      case 'year-old':
        sortedFiltered.sort((a, b) => a.year - b.year);
        break;
      case 'mileage-low':
        sortedFiltered.sort((a, b) => a.mileage - b.mileage);
        break;
      case 'rating-high':
        sortedFiltered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        sortedFiltered.sort((a, b) => b.year - a.year);
    }
    
    return sortedFiltered;
  }, [searchTerm, selectedType, selectedLocation, selectedBrand, priceRange, yearRange, sortBy]);

  const handleFavoriteToggle = (propertyId: number) => {
    setFavorites(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleDetailView = (propertyId: number) => {
    router.push(`/property/${propertyId}`);
  };

  const handleCompare = () => {
    router.push('/property/compare');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('ko-KR').format(mileage) + 'km';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
       <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            오토바이 매물 구매
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filteredProperties.length}개의 매물을 찾았습니다
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<CompareIcon />}
          onClick={handleCompare}
        >
          매물 비교하기
        </Button>
      </Box>

      {/* 검색 및 필터 바 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="브랜드, 모델명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>정렬</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="정렬"
              >
                <MenuItem value="newest">최신순</MenuItem>
                <MenuItem value="price-low">가격 낮은순</MenuItem>
                <MenuItem value="price-high">가격 높은순</MenuItem>
                <MenuItem value="year-new">연식 최신순</MenuItem>
                <MenuItem value="year-old">연식 오래된순</MenuItem>
                <MenuItem value="mileage-low">주행거리 적은순</MenuItem>
                <MenuItem value="rating-high">평점 높은순</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
            >
              <ToggleButton value="grid">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              fullWidth
            >
              필터 {showFilters ? '숨기기' : '보기'}
            </Button>
          </Grid>
        </Grid>

        {/* 고급 필터 */}
        <Collapse in={showFilters}>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>바이크 타입</InputLabel>
                  <Select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    label="바이크 타입"
                  >
                    <MenuItem value="">전체</MenuItem>
                    <MenuItem value={PropertyType.ADVENTURE_TOURERS}>어드벤처/투어러</MenuItem>
                    <MenuItem value={PropertyType.AGRICULTURE}>농업용</MenuItem>
                    <MenuItem value={PropertyType.ALL_TERRAIN_VEHICLES}>전지형차량</MenuItem>
                    <MenuItem value={PropertyType.DIRT}>더트바이크</MenuItem>
                    <MenuItem value={PropertyType.ELECTRIC}>전기바이크</MenuItem>
                    <MenuItem value={PropertyType.ENDURO}>엔듀로</MenuItem>
                    <MenuItem value={PropertyType.MINI_BIKES}>미니바이크</MenuItem>
                    <MenuItem value={PropertyType.SXS_UTV}>SXS/UTV</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>지역</InputLabel>
                  <Select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    label="지역"
                  >
                    <MenuItem value="">전체</MenuItem>
                    <MenuItem value={PropertyLocation.SEOUL}>서울</MenuItem>
                    <MenuItem value={PropertyLocation.BUSAN}>부산</MenuItem>
                    <MenuItem value={PropertyLocation.INCHEON}>인천</MenuItem>
                    <MenuItem value={PropertyLocation.DAEGU}>대구</MenuItem>
                    <MenuItem value={PropertyLocation.GYEONGGI}>경기</MenuItem>
                    <MenuItem value={PropertyLocation.GWANGJU}>광주</MenuItem>
                    <MenuItem value={PropertyLocation.DAEJEON}>대전</MenuItem>
                    <MenuItem value={PropertyLocation.JEJU}>제주</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>브랜드</InputLabel>
                  <Select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    label="브랜드"
                  >
                    <MenuItem value="">전체</MenuItem>
                    <MenuItem value="Honda">Honda</MenuItem>
                    <MenuItem value="Yamaha">Yamaha</MenuItem>
                    <MenuItem value="Suzuki">Suzuki</MenuItem>
                    <MenuItem value="Kawasaki">Kawasaki</MenuItem>
                    <MenuItem value="BMW">BMW</MenuItem>
                    <MenuItem value="Ducati">Ducati</MenuItem>
                    <MenuItem value="KTM">KTM</MenuItem>
                    <MenuItem value="Zero">Zero</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography gutterBottom>가격 범위</Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue as [number, number])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={50000000}
                  step={1000000}
                  valueLabelFormat={(value) => formatPrice(value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography gutterBottom>연식 범위</Typography>
                <Slider
                  value={yearRange}
                  onChange={(e, newValue) => setYearRange(newValue as [number, number])}
                  valueLabelDisplay="auto"
                  min={2010}
                  max={2024}
                  step={1}
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* 매물 목록 */}
      <Grid container spacing={1.5}>
        {filteredProperties.map((property) => (
          <Grid item xs={12} sm={6} md={viewMode === 'grid' ? 2.4 : 12} key={property.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: viewMode === 'grid' ? 'column' : 'row' }}>
              <CardMedia
                component="img"
                sx={{
                  width: viewMode === 'grid' ? '100%' : 200,
                  height: viewMode === 'grid' ? 160 : 'auto',
                  objectFit: 'cover',
                }}
                image={brandLogos[property.brand as keyof typeof brandLogos] || '/img/logo/Honda_Logo.svg'}
                alt={property.title}
              />
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: viewMode === 'grid' ? 1.5 : 2, '&:last-child': { pb: viewMode === 'grid' ? 1.5 : 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant={viewMode === 'grid' ? 'subtitle1' : 'h6'} component="h2" gutterBottom sx={{ fontSize: viewMode === 'grid' ? '0.9rem' : '1.25rem' }}>
                    {property.title}
                  </Typography>
                  <IconButton
                    onClick={() => handleFavoriteToggle(property.id)}
                    color={favorites.includes(property.id) ? 'error' : 'default'}
                  >
                    {favorites.includes(property.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={property.rating} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {property.rating}
                  </Typography>
                </Box>

                <Typography variant={viewMode === 'grid' ? 'h6' : 'h5'} color="primary" sx={{ mb: 1, fontSize: viewMode === 'grid' ? '1rem' : '1.5rem' }}>
                  {formatPrice(property.price)}
                </Typography>

                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <YearIcon sx={{ mr: 1, fontSize: 'small' }} />
                      <Typography variant="body2">{property.year}년</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SpeedIcon sx={{ mr: 1, fontSize: 'small' }} />
                      <Typography variant="body2">{formatMileage(property.mileage)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ mr: 1, fontSize: 'small' }} />
                      <Typography variant="body2">{property.location}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BikeIcon sx={{ mr: 1, fontSize: 'small' }} />
                      <Typography variant="body2">{property.transmission}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mb: 2 }}>
                  <Chip label={property.type} size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label={property.fuelType} size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label={property.condition} size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label={property.color} size="small" sx={{ mb: 1 }} />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, flex: 1, fontSize: viewMode === 'grid' ? '0.8rem' : '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: viewMode === 'grid' ? 2 : 3, WebkitBoxOrient: 'vertical' }}>
                  {property.description}
                </Typography>

                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <Typography variant="body2" color="text.secondary">
                     판매자: {property.seller}
                   </Typography>
                                     <Button 
                    variant="contained" 
                    color="primary"
                    size={viewMode === 'grid' ? 'small' : 'medium'}
                    onClick={() => handleDetailView(property.id)}
                  >
                    상세보기
                  </Button>
                 </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredProperties.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            검색 조건에 맞는 매물이 없습니다.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            다른 검색 조건을 시도해보세요.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PropertyBuyList; 