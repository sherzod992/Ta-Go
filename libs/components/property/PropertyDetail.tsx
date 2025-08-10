import React, { useState } from 'react';
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
import { GET_PROPERTY } from '../../../apollo/user/query';

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
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
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

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                판매자 정보
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body1" sx={{ mr: 1 }}>
                  {property.memberData?.memberFullName || property.memberData?.memberNick || '판매자'}
                </Typography>
                <Rating value={4.5} size="small" readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  (15개 리뷰)
                </Typography>
              </Box>
              {property.memberData?.memberPhone && (
                <Typography variant="body2" color="text.secondary">
                  연락처: {property.memberData.memberPhone}
                </Typography>
              )}
            </Box>

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

          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PhoneIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              판매자 연락처
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              {property.memberData?.memberPhone || '연락처 정보 없음'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {property.memberData?.memberFullName || property.memberData?.memberNick || '판매자'}
            </Typography>
          </Box>
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
            추가 정보
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            상세한 구매 혜택 및 추가 정보는 판매자에게 연락하세요.
          </Typography>
          
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" gutterBottom>
              판매자 연락처
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              {property.memberData?.memberPhone || '연락처 정보 없음'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {property.memberData?.memberFullName || property.memberData?.memberNick || '판매자'}
            </Typography>
          </Box>
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