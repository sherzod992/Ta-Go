import React, { useState } from 'react';
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

const PropertyDetail: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(mockPropertyDetail.isFavorite);
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
        title: mockPropertyDetail.title,
        text: mockPropertyDetail.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {mockPropertyDetail.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Rating value={mockPropertyDetail.rating} precision={0.1} readOnly />
          <Typography variant="body2">
            {mockPropertyDetail.rating} ({mockPropertyDetail.sellerReviews}개 리뷰)
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 이미지 섹션 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={mockPropertyDetail.images[selectedImage]}
              alt={mockPropertyDetail.title}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent>
              <Grid container spacing={1}>
                {mockPropertyDetail.images.map((image, index) => (
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
                        alt={`${mockPropertyDetail.title} ${index + 1}`}
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
                {formatPrice(mockPropertyDetail.price)}
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
              <Chip label={mockPropertyDetail.type} sx={{ mr: 1, mb: 1 }} />
              <Chip label={mockPropertyDetail.fuelType} sx={{ mr: 1, mb: 1 }} />
              <Chip label={mockPropertyDetail.condition} sx={{ mr: 1, mb: 1 }} />
              <Chip label={mockPropertyDetail.color} sx={{ mb: 1 }} />
            </Box>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <YearIcon />
                </ListItemIcon>
                <ListItemText primary="연식" secondary={`${mockPropertyDetail.year}년`} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SpeedIcon />
                </ListItemIcon>
                <ListItemText primary="주행거리" secondary={formatMileage(mockPropertyDetail.mileage)} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon />
                </ListItemIcon>
                <ListItemText primary="위치" secondary={mockPropertyDetail.location} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BikeIcon />
                </ListItemIcon>
                <ListItemText primary="변속기" secondary={mockPropertyDetail.transmission} />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                판매자 정보
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body1" sx={{ mr: 1 }}>
                  {mockPropertyDetail.seller}
                </Typography>
                <Rating value={mockPropertyDetail.sellerRating} size="small" readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({mockPropertyDetail.sellerReviews}개 리뷰)
                </Typography>
              </Box>
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
                <strong>보증:</strong> {mockPropertyDetail.warranty}
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
            {mockPropertyDetail.description}
          </Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">주요 특징</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                {mockPropertyDetail.features.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckIcon color="success" sx={{ mr: 1 }} />
                      <Typography>{feature}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            {Object.entries(mockPropertyDetail.specifications).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {key}
                  </Typography>
                  <Typography variant="h6">{value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            정비 이력
          </Typography>
          <List>
            {mockPropertyDetail.history.map((item, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText
                  primary={item.event}
                  secondary={`${item.date} - ${formatMileage(item.mileage)}`}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            최근 정비 상태
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  타이어 상태
                </Typography>
                <Typography variant="h6">{mockPropertyDetail.maintenance.tireCondition}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  브레이크 상태
                </Typography>
                <Typography variant="h6">{mockPropertyDetail.maintenance.brakeCondition}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            구매 혜택
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Alert severity="success" icon={<CheckIcon />}>
                <Typography variant="body2">
                  <strong>할부 가능:</strong> {mockPropertyDetail.financing}
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="body2">
                  <strong>교환 가능:</strong> {mockPropertyDetail.tradeIn}
                </Typography>
              </Alert>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            보유 서류
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {mockPropertyDetail.documents.map((doc, index) => (
              <Chip key={index} label={doc} color="primary" variant="outlined" />
            ))}
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