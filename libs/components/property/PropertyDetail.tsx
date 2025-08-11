import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  Paper,
  Divider,
  IconButton,
  Rating,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  Speed as SpeedIcon,
  CalendarToday as YearIcon,
  DirectionsBike as BikeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  PropertyType,
  PropertyLocation,
  FuelType,
  TransmissionType,
  ConditionType,
} from '../../enums/property.enum';
import { GET_PROPERTY, GET_MEMBER, GET_MEMBER_PROPERTIES, GET_MEMBER_PROPERTY_STATS } from '../../../apollo/user/query';

// 하드코드된 매물 상세 데이터
const mockPropertyDetail = {
  id: 1,
  title: '2022 Honda CBR1000RR-R Fireblade',
  price: 25000000,
  year: 2022,
  mileage: 5000,
  location: PropertyLocation.SEOUL,
  type: PropertyType.ADVENTURE_TOURERS,
  fuelType: FuelType.GASOLINE,
  transmission: TransmissionType.MANUAL,
  condition: ConditionType.EXCELLENT,
  brand: 'Honda',
  model: 'CBR1000RR-R Fireblade',
  color: '빨강',
  description: '최신 모델의 파이어블레이드입니다. 완벽한 상태로 보관되어 있으며, 레이싱 성능을 자랑합니다. 정기 점검을 받았으며, 모든 부품이 정상 작동합니다. 원래 소유자가 신중하게 관리한 바이크로, 새차와 다름없는 상태입니다.',
  images: [
    '/img/logo/Honda_Logo.svg',
    '/img/logo/Honda_Logo.svg',
    '/img/logo/Honda_Logo.svg',
    '/img/logo/Honda_Logo.svg',
  ],
  rating: 4.8,
  isFavorite: false,
  contact: '010-1234-5678',
  email: 'kim.biker@email.com',
  seller: '김바이커',
  sellerRating: 4.9,
  sellerReviews: 127,
  features: ['ABS', '트랙션 컨트롤', '파워 모드', '퀵 시프터', 'LED 헤드라이트', '디지털 계기판'],
  specifications: {
    engine: '999cc 4기통',
    power: '217hp',
    torque: '113Nm',
    weight: '201kg',
    fuelCapacity: '16.1L',
    seatHeight: '830mm',
    wheelbase: '1455mm',
  },
  maintenance: {
    lastService: '2024-01-15',
    nextService: '2024-07-15',
    oilChange: '2024-02-01',
    tireCondition: '90%',
    brakeCondition: '95%',
  },
  history: [
    { date: '2022-03-15', event: '신차 구매', mileage: 0 },
    { date: '2022-06-20', event: '첫 정기점검', mileage: 1000 },
    { date: '2023-01-10', event: '오일 교체', mileage: 3000 },
    { date: '2023-07-05', event: '타이어 교체', mileage: 4000 },
    { date: '2024-01-15', event: '최근 정기점검', mileage: 5000 },
  ],
  documents: ['등록증', '정비이력서', '보험증', '검사증'],
  warranty: '2025년 3월까지 보증',
  financing: '할부 가능 (최대 36개월)',
  tradeIn: '중고 바이크 교환 가능',
};

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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface PropertyDetailProps {
  propertyId?: string;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ propertyId }) => {
  // GraphQL 쿼리로 매물 데이터 가져오기
  const { data, loading, error } = useQuery(GET_PROPERTY, {
    variables: { input: propertyId || '' },
    skip: !propertyId,
    fetchPolicy: 'cache-and-network',
  });

  const property = data?.getProperty;
  
  // memberData가 없을 때 별도로 member 정보 가져오기
  const { data: memberData, loading: memberLoading } = useQuery(GET_MEMBER, {
    variables: { input: property?.memberId || '' },
    skip: !property?.memberId || !!property?.memberData,
    fetchPolicy: 'cache-and-network',
  });

  // 판매자 정보 (memberData가 있으면 사용, 없으면 별도 쿼리 결과 사용)
  const sellerInfo = property?.memberData || memberData?.getMember;

  // 판매자의 매물 통계 정보 가져오기
  const { data: propertyStats, loading: statsLoading } = useQuery(GET_MEMBER_PROPERTY_STATS, {
    variables: { memberId: sellerInfo?._id || '' },
    skip: !sellerInfo?._id,
    fetchPolicy: 'cache-and-network',
  });

  // 판매자의 다른 매물 목록 가져오기 (최대 4개)
  const { data: otherProperties, loading: otherPropertiesLoading } = useQuery(GET_MEMBER_PROPERTIES, {
    variables: { 
      targetMemberId: sellerInfo?._id || '', 
      page: 1, 
      limit: 4 
    },
    skip: !sellerInfo?._id,
    fetchPolicy: 'cache-and-network',
  });

  // 매물 통계 정보
  const stats = propertyStats?.getMemberPropertyStats;
  
  // 디버깅을 위한 로그
  console.log('Property data:', property);
  console.log('Member data:', property?.memberData);
  console.log('Seller info:', sellerInfo);
  console.log('Property stats:', stats);
  console.log('Other properties:', otherProperties?.getMemberProperties?.list);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(Boolean(property?.meLiked) || false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // 좋아요 상태 업데이트
  useEffect(() => {
    setIsFavorite(Boolean(property?.meLiked) || false);
  }, [property?.meLiked]);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('ko-KR').format(mileage) + 'km';
  };

  const handleContactSubmit = () => {
    // 연락처 제출 로직
    console.log('Contact form submitted:', contactForm);
    setContactDialogOpen(false);
    setContactForm({ name: '', phone: '', email: '', message: '' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.propertyTitle || '매물 정보',
        text: property?.propertyDesc || '매물 상세 정보',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          매물 정보를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          매물 정보를 불러오는데 실패했습니다. 다시 시도해주세요.
        </Alert>
      </Box>
    );
  }

  // 매물이 없는 경우
  if (!property) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          해당 매물을 찾을 수 없습니다.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {property.propertyTitle}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Rating value={4.5} precision={0.1} readOnly />
          <Typography variant="body2">
            4.5 (15개 리뷰)
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {property.propertyBrand} {property.propertyModel} ({property.propertyYear}년)
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 이미지 섹션 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={property.propertyImages?.[selectedImage] || '/img/typeImages/type1.png'}
              alt={property.propertyTitle}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent>
              <Grid container spacing={1}>
                {(property.propertyImages || ['/img/typeImages/type1.png']).map((image, index) => (
                  <Grid item key={index}>
                    <Card
                      sx={{
                        width: 80,
                        height: 60,
                        cursor: 'pointer',
                        border: selectedImage === index ? 2 : 1,
                        borderColor: selectedImage === index ? 'primary.main' : 'divider',
                      }}
                      onClick={() => setSelectedImage(index)}
                    >
                      <CardMedia
                        component="img"
                        height="100%"
                        image={image}
                        alt={`${property.propertyTitle} ${index + 1}`}
                        sx={{ objectFit: 'cover' }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 정보 섹션 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" color="primary">
                {formatPrice(property.propertyPrice)}
              </Typography>
              <Box>
                <IconButton onClick={() => setIsFavorite(!isFavorite)} color={isFavorite ? 'error' : 'default'}>
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <IconButton onClick={handleShare}>
                  <ShareIcon />
                </IconButton>
                <IconButton>
                  <PrintIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Chip label={property.propertyType} sx={{ mr: 1, mb: 1 }} />
              <Chip label={property.propertyFuelType} sx={{ mr: 1, mb: 1 }} />
              <Chip label={property.propertyCondition} sx={{ mr: 1, mb: 1 }} />
              <Chip label={property.propertyColor} sx={{ mb: 1 }} />
            </Box>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <YearIcon />
                </ListItemIcon>
                <ListItemText primary="연식" secondary={`${property.propertyYear}년`} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SpeedIcon />
                </ListItemIcon>
                <ListItemText primary="주행거리" secondary={formatMileage(property.propertyMileage)} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon />
                </ListItemIcon>
                <ListItemText primary="위치" secondary={property.propertyLocation} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BikeIcon />
                </ListItemIcon>
                <ListItemText primary="변속기" secondary={property.propertyTransmission} />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            {/* 판매자 정보 카드 */}
            <Card sx={{ mb: 3, p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                판매자 정보
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  backgroundColor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  mr: 2
                }}>
                  {sellerInfo?.memberFullName?.charAt(0) || 
                   sellerInfo?.memberNick?.charAt(0) || '판'}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {sellerInfo?.memberFullName || sellerInfo?.memberNick || '판매자'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={4.5} size="small" readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      4.5 (15개 리뷰)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {sellerInfo?.memberAddress || '위치 정보 없음'}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    {statsLoading ? (
                      <Skeleton variant="text" width="60%" height={32} />
                    ) : (
                      <Typography variant="h6" color="primary">
                        {stats?.activeProperties || 0}
                      </Typography>
                    )}
                    <Typography variant="body2">활성 매물</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    {statsLoading ? (
                      <Skeleton variant="text" width="60%" height={32} />
                    ) : (
                      <Typography variant="h6" color="primary">
                        {stats?.totalViews || 0}
                      </Typography>
                    )}
                    <Typography variant="body2">총 조회수</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    {statsLoading ? (
                      <Skeleton variant="text" width="60%" height={32} />
                    ) : (
                      <Typography variant="h6" color="primary">
                        {stats?.totalLikes || 0}
                      </Typography>
                    )}
                    <Typography variant="body2">총 좋아요</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    {statsLoading ? (
                      <Skeleton variant="text" width="60%" height={32} />
                    ) : (
                      <Typography variant="h6" color="primary">
                        {stats?.soldProperties || 0}
                      </Typography>
                    )}
                    <Typography variant="body2">판매 완료</Typography>
                  </Box>
                </Grid>
              </Grid>

              {sellerInfo?.memberPhone && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {sellerInfo.memberPhone}
                  </Typography>
                </Box>
              )}
              
              {sellerInfo?.memberEmail && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {sellerInfo.memberEmail}
                  </Typography>
                </Box>
              )}

              {sellerInfo?.memberDesc && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {sellerInfo.memberDesc}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<BikeIcon />}
                  onClick={() => {
                    // 판매자의 다른 매물 페이지로 이동
                    window.open(`/property?memberId=${sellerInfo?._id}`, '_blank');
                  }}
                >
                  판매자의 다른 매물 보기
                </Button>
              </Box>
            </Card>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<PhoneIcon />}
                onClick={() => setContactDialogOpen(true)}
              >
                연락하기
              </Button>
              <Button variant="outlined" fullWidth>
                시승 신청
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>보증:</strong> {property.propertyWarranty ? '보증 가능' : '보증 없음'}
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* 상세 정보 탭 */}
      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="상세정보" />
          <Tab label="제원" />
          <Tab label="정비이력" />
          <Tab label="특징" />
          <Tab label="판매자 매물" icon={<BikeIcon />} iconPosition="start" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" paragraph>
            {property.propertyDesc || '상세한 사항은 판매자에게 연락하세요.'}
          </Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">주요 특징</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <Typography>브랜드: {property.propertyBrand}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <Typography>모델: {property.propertyModel}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <Typography>엔진 크기: {property.propertyEngineSize}cc</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <Typography>색상: {property.propertyColor}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="body2" color="text.secondary" paragraph>
            상세한 제원 정보는 판매자에게 연락하세요.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  브랜드
                </Typography>
                <Typography variant="h6">{property.propertyBrand}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  모델
                </Typography>
                <Typography variant="h6">{property.propertyModel}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  엔진 크기
                </Typography>
                <Typography variant="h6">{property.propertyEngineSize}cc</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  연료 타입
                </Typography>
                <Typography variant="h6">{property.propertyFuelType}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  변속기
                </Typography>
                <Typography variant="h6">{property.propertyTransmission}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  연식
                </Typography>
                <Typography variant="h6">{property.propertyYear}년</Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            정비 이력
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            상세한 정비 이력은 판매자에게 연락하세요.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              정비 이력 및 상세한 사항은 판매자 연락처로 문의해주세요.
            </Typography>
          </Alert>

          {/* 판매자 상세 정보 */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              판매자 상세 정보
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    mr: 3
                  }}>
                    {sellerInfo?.memberFullName?.charAt(0) || 
                     sellerInfo?.memberNick?.charAt(0) || '판'}
                  </Box>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {sellerInfo?.memberFullName || sellerInfo?.memberNick || '판매자'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={4.5} readOnly />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        4.5 (15개 리뷰)
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {sellerInfo?.memberAddress || '위치 정보 없음'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="h4" color="primary">
                        {stats?.activeProperties || 0}
                      </Typography>
                      <Typography variant="body2">활성 매물</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="h4" color="primary">
                        {stats?.totalViews || 0}
                      </Typography>
                      <Typography variant="body2">총 조회수</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="h4" color="primary">
                        {stats?.totalLikes || 0}
                      </Typography>
                      <Typography variant="body2">총 좋아요</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="h4" color="primary">
                        {stats?.soldProperties || 0}
                      </Typography>
                      <Typography variant="body2">판매 완료</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {sellerInfo?.memberDesc && (
              <Box sx={{ mt: 3, p: 3, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  판매자 소개
                </Typography>
                <Typography variant="body1">
                  {sellerInfo.memberDesc}
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                연락처 정보
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
                {sellerInfo?.memberPhone && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" color="primary">
                      {sellerInfo.memberPhone}
                    </Typography>
                  </Box>
                )}
                {sellerInfo?.memberEmail && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" color="primary">
                      {sellerInfo.memberEmail}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<BikeIcon />}
                onClick={() => {
                  window.open(`/property?memberId=${sellerInfo?._id}`, '_blank');
                }}
                sx={{ mr: 2 }}
              >
                판매자의 다른 매물 보기
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<PhoneIcon />}
                onClick={() => setContactDialogOpen(true)}
              >
                판매자에게 연락하기
              </Button>
            </Box>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            구매 혜택
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Alert severity="success" icon={<CheckIcon />}>
                <Typography variant="body2">
                  <strong>할부 가능:</strong> {property.propertyFinancing ? '가능' : '불가능'}
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="body2">
                  <strong>보증:</strong> {property.propertyWarranty ? '보증 가능' : '보증 없음'}
                </Typography>
              </Alert>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            판매자 신뢰도
          </Typography>
          
          {statsLoading ? (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item}>
                  <Card sx={{ p: 2, textAlign: 'center' }}>
                    <Skeleton variant="text" width="60%" height={48} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {stats?.activeProperties || 0}
                  </Typography>
                  <Typography variant="body2">활성 매물</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {stats?.totalViews || 0}
                  </Typography>
                  <Typography variant="body2">총 조회수</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {stats?.totalLikes || 0}
                  </Typography>
                  <Typography variant="body2">총 좋아요</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {stats?.soldProperties || 0}
                  </Typography>
                  <Typography variant="body2">판매 완료</Typography>
                </Card>
              </Grid>
            </Grid>
          )}

          {stats && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>매물 통계:</strong> 총 {stats.totalProperties}개의 매물을 등록했으며, 
                {stats.activeProperties}개가 현재 활성 상태입니다. 
                총 {stats.totalViews}회 조회되었고 {stats.totalLikes}개의 좋아요를 받았습니다.
              </Typography>
            </Alert>
          )}

          {stats && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                매물 통계 요약
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="primary">
                      {stats.totalProperties}
                    </Typography>
                    <Typography variant="body2">총 등록 매물</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main">
                      {stats.activeProperties}
                    </Typography>
                    <Typography variant="body2">현재 활성 매물</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          <Typography variant="h6" gutterBottom>
            판매자 소개
          </Typography>
          {sellerInfo?.memberDesc ? (
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="body1">
                {sellerInfo.memberDesc}
              </Typography>
            </Card>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                판매자 소개 정보가 없습니다. 연락처로 문의해주세요.
              </Typography>
            </Alert>
          )}

          <Typography variant="h6" gutterBottom>
            연락처 정보
          </Typography>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 3 }}>
              {sellerInfo?.memberPhone && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 1, color: 'primary.main', fontSize: '2rem' }} />
                  <Box>
                    <Typography variant="h6" color="primary">
                      {sellerInfo.memberPhone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      전화번호
                    </Typography>
                  </Box>
                </Box>
              )}
              {sellerInfo?.memberEmail && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1, color: 'primary.main', fontSize: '2rem' }} />
                  <Box>
                    <Typography variant="h6" color="primary">
                      {sellerInfo.memberEmail}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      이메일
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<BikeIcon />}
                onClick={() => {
                  window.open(`/property?memberId=${sellerInfo?._id}`, '_blank');
                }}
              >
                판매자의 다른 매물 보기
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<PhoneIcon />}
                onClick={() => setContactDialogOpen(true)}
              >
                판매자에게 연락하기
              </Button>
            </Box>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            판매자의 다른 매물 ({otherProperties?.getMemberProperties?.metaCounter?.total || 0}개)
          </Typography>
          
          {otherPropertiesLoading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item}>
                  <Card sx={{ height: '100%' }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent sx={{ p: 2 }}>
                      <Skeleton variant="text" width="80%" height={24} />
                      <Skeleton variant="text" width="60%" height={32} />
                      <Skeleton variant="text" width="70%" height={20} />
                      <Skeleton variant="text" width="50%" height={20} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
                      ) : otherProperties?.getMemberProperties?.list?.length > 0 ? (
              <Grid container spacing={3}>
                {otherProperties.getMemberProperties.list
                  .filter((otherProperty: any) => otherProperty._id !== property?._id) // 현재 매물 제외
                  .slice(0, 4) // 최대 4개만 표시
                  .map((otherProperty: any) => (
                  <Grid item xs={12} sm={6} md={3} key={otherProperty._id}>
                    <Card sx={{ 
                      height: 400, 
                      cursor: 'pointer', 
                      transition: 'all 0.3s ease', 
                      boxShadow: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      overflow: 'hidden',
                      '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      } 
                    }} onClick={() => {
                      window.open(`/property/${otherProperty._id}`, '_blank');
                    }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={otherProperty.propertyImages?.[0] || '/img/typeImages/type1.png'}
                        alt={otherProperty.propertyTitle}
                        sx={{ 
                          objectFit: 'cover',
                          position: 'relative',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                                              <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <Typography variant="h6" noWrap gutterBottom sx={{ fontWeight: 'bold' }}>
                            {otherProperty.propertyTitle}
                          </Typography>
                          <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {formatPrice(otherProperty.propertyPrice)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 'medium' }}>
                            {otherProperty.propertyBrand} {otherProperty.propertyModel}
                          </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                            {otherProperty.propertyYear}년
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                            {formatMileage(otherProperty.propertyMileage)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                          {otherProperty.propertyLocation}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={otherProperty.propertyStatus === 'ACTIVE' ? '판매중' : '판매완료'} 
                            size="small" 
                            color={otherProperty.propertyStatus === 'ACTIVE' ? 'primary' : 'default'}
                            sx={{ 
                              fontWeight: 'bold',
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontWeight: 'medium' }}>
                              👁️ {otherProperty.propertyViews || 0}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton size="small" disabled>
                              {Boolean(otherProperty.meLiked) ? <FavoriteIcon color="error" fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                            </IconButton>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                              {otherProperty.propertyLikes || 0}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto', display: 'block', textAlign: 'center', pt: 1, borderTop: 1, borderColor: 'divider', fontWeight: 'medium' }}>
                          📅 {new Date(otherProperty.createdAt).toLocaleDateString('ko-KR')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {otherProperties?.getMemberProperties?.list?.filter((p: any) => p._id !== property?._id).length === 0 
                  ? '이 판매자의 다른 매물이 아직 없습니다. 첫 번째 매물을 구매해보세요! 🏍️' 
                  : '현재 표시할 다른 매물이 없습니다. 곧 새로운 매물이 등록될 예정입니다! 🚀'}
              </Typography>
            </Alert>
          )}

          {otherProperties?.getMemberProperties?.metaCounter?.total > 4 && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<BikeIcon />}
                onClick={() => {
                  window.open(`/property?memberId=${sellerInfo?._id}`, '_blank');
                }}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                모든 매물 보기 ({otherProperties.getMemberProperties.metaCounter.total}개)
              </Button>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* 연락처 다이얼로그 */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>판매자에게 연락하기</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="이름"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="전화번호"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="이메일"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="문의사항"
                multiline
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="매물에 대한 문의사항을 작성해주세요."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>취소</Button>
          <Button onClick={handleContactSubmit} variant="contained">
            연락하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertyDetail; 