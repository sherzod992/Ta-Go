import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Compare as CompareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import {
  PropertyType,
  PropertyLocation,
  FuelType,
  TransmissionType,
  PropertyCondition,
} from '../../enums/property.enum';

// 비교용 하드코드 데이터
const mockCompareProperties = [
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
    rating: 4.8,
    engine: '999cc 4기통',
    power: '217hp',
    weight: '201kg',
    fuelCapacity: '16.1L',
    image: '/img/logo/Honda_Logo.svg',
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
    rating: 4.6,
    engine: '998cc 4기통',
    power: '200hp',
    weight: '199kg',
    fuelCapacity: '16L',
    image: '/img/logo/yamaha.webp',
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
    rating: 4.9,
    engine: '1254cc 2기통',
    power: '136hp',
    weight: '268kg',
    fuelCapacity: '30L',
    image: '/img/logo/BMWMotorrad.jpg',
    features: ['ABS', '트랙션 컨트롤', '크루즈 컨트롤', '전자 서스펜션'],
  },
];

const PropertyCompare: React.FC = () => {
  const [selectedProperties, setSelectedProperties] = useState<number[]>([1, 2, 3]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('ko-KR').format(mileage) + 'km';
  };

  const removeProperty = (propertyId: number) => {
    setSelectedProperties(prev => prev.filter(id => id !== propertyId));
  };

  const getPropertyById = (id: number) => {
    return mockCompareProperties.find(prop => prop.id === id);
  };

  const selectedPropertyData = selectedProperties
    .map(id => getPropertyById(id))
    .filter(Boolean);

  const comparisonData = [
    { label: '가격', key: 'price', format: formatPrice },
    { label: '연식', key: 'year', format: (value: number) => `${value}년` },
    { label: '주행거리', key: 'mileage', format: formatMileage },
    { label: '지역', key: 'location' },
    { label: '타입', key: 'type' },
    { label: '연료', key: 'fuelType' },
    { label: '변속기', key: 'transmission' },
    { label: '상태', key: 'condition' },
    { label: '색상', key: 'color' },
    { label: '엔진', key: 'engine' },
    { label: '출력', key: 'power' },
    { label: '무게', key: 'weight' },
    { label: '연료탱크', key: 'fuelCapacity' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          매물 비교
        </Typography>
        <Typography variant="body1" color="text.secondary">
          선택한 매물들을 비교해보세요
        </Typography>
      </Box>

      {selectedPropertyData.length === 0 ? (
        <Alert severity="info">
          비교할 매물을 선택해주세요.
        </Alert>
      ) : (
        <>
          {/* 선택된 매물 카드 */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {selectedPropertyData.map((property) => (
              <Grid item xs={12} md={4} key={property?.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={property?.image}
                    alt={property?.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" gutterBottom>
                        {property?.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => removeProperty(property?.id || 0)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {formatPrice(property?.price || 0)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={property?.rating || 0} size="small" readOnly />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {property?.rating}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip label={property?.type} size="small" />
                      <Chip label={property?.fuelType} size="small" />
                      <Chip label={property?.condition} size="small" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* 비교 테이블 */}
          <Paper sx={{ overflow: 'auto' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 150, fontWeight: 'bold' }}>비교 항목</TableCell>
                    {selectedPropertyData.map((property) => (
                      <TableCell key={property?.id} align="center" sx={{ minWidth: 200 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {property?.brand} {property?.model}
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatPrice(property?.price || 0)}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparisonData.map((item) => (
                    <TableRow key={item.key}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        {item.label}
                      </TableCell>
                      {selectedPropertyData.map((property) => (
                        <TableCell key={property?.id} align="center">
                          {item.format 
                            ? item.format(property?.[item.key as keyof typeof property] as number)
                            : property?.[item.key as keyof typeof property]
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  
                  {/* 특징 비교 */}
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      주요 특징
                    </TableCell>
                    {selectedPropertyData.map((property) => (
                      <TableCell key={property?.id} align="center">
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {property?.features.map((feature, index) => (
                            <Chip key={index} label={feature} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* 요약 정보 */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              비교 요약
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  최저가
                </Typography>
                <Typography variant="h6" color="success.main">
                  {formatPrice(Math.min(...selectedPropertyData.map(p => p?.price || 0)))}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  최고가
                </Typography>
                <Typography variant="h6" color="error.main">
                  {formatPrice(Math.max(...selectedPropertyData.map(p => p?.price || 0)))}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  평균가
                </Typography>
                <Typography variant="h6">
                  {formatPrice(
                    Math.round(
                      selectedPropertyData.reduce((sum, p) => sum + (p?.price || 0), 0) / selectedPropertyData.length
                    )
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}

      {/* 매물 추가 다이얼로그 */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>비교할 매물 추가</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {mockCompareProperties
              .filter(prop => !selectedProperties.includes(prop.id))
              .map((property) => (
                <Grid item xs={12} sm={6} key={property.id}>
                  <Card 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedProperties(prev => [...prev, property.id]);
                      setShowAddDialog(false);
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={property.image}
                      alt={property.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {property.title}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatPrice(property.price)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>취소</Button>
        </DialogActions>
      </Dialog>

      {/* 매물 추가 버튼 */}
      {selectedPropertyData.length < 3 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<CompareIcon />}
            onClick={() => setShowAddDialog(true)}
          >
            매물 추가 ({selectedPropertyData.length}/3)
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PropertyCompare; 