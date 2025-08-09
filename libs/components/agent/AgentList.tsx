import React, { useState, useMemo } from 'react';
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
  Rating,
  IconButton,
  Avatar,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  DirectionsBike as BikeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Message as MessageIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';

// 하드코드된 agent 데이터 (매물을 올린 agent만)
const mockAgents = [
  {
    id: 1,
    name: '김바이커',
    company: '서울바이크',
    avatar: '/img/logo/Honda_Logo.svg',
    location: '서울시 강남구',
    rating: 4.8,
    reviewCount: 127,
    propertyCount: 15,
    isVerified: true,
    phone: '010-1234-5678',
    email: 'kim.biker@seoulbike.com',
    description: '10년 경력의 오토바이 전문 딜러입니다. 정직하고 신뢰할 수 있는 거래를 약속드립니다.',
    specialties: ['스포츠바이크', '투어러', '클래식'],
    recentProperties: [
      { id: 1, title: '2022 Honda CBR1000RR-R', price: 25000000, image: '/img/logo/Honda_Logo.svg' },
      { id: 2, title: '2021 Yamaha YZF-R1', price: 22000000, image: '/img/logo/yamaha.webp' },
      { id: 3, title: '2023 BMW R 1250 GS', price: 35000000, image: '/img/logo/BMWMotorrad.jpg' },
    ],
    languages: ['한국어', '영어'],
    experience: '10년',
    certifications: ['오토바이 딜러 자격증', '정비사 자격증'],
  },
  {
    id: 2,
    name: '이스피드',
    company: '부산모터사이클',
    avatar: '/img/logo/yamaha.webp',
    location: '부산시 해운대구',
    rating: 4.6,
    reviewCount: 89,
    propertyCount: 12,
    isVerified: true,
    phone: '010-2345-6789',
    email: 'lee.speed@busanmotor.com',
    description: '부산 지역 최고의 오토바이 딜러입니다. 다양한 브랜드와 모델을 취급합니다.',
    specialties: ['스포츠바이크', '네이키드', '스쿠터'],
    recentProperties: [
      { id: 4, title: '2020 Ducati Panigale V4', price: 40000000, image: '/img/logo/Ducati.webp' },
      { id: 5, title: '2021 KTM 390 Duke', price: 8500000, image: '/img/logo/kTm.jpeg' },
    ],
    languages: ['한국어', '일본어'],
    experience: '8년',
    certifications: ['오토바이 딜러 자격증'],
  },
  {
    id: 3,
    name: '박어드벤처',
    company: '경기투어링',
    avatar: '/img/logo/BMWMotorrad.jpg',
    location: '경기도 성남시',
    rating: 4.9,
    reviewCount: 203,
    propertyCount: 23,
    isVerified: true,
    phone: '010-3456-7890',
    email: 'park.adventure@gyeonggi.com',
    description: '어드벤처 바이크 전문 딜러입니다. 장거리 투어링에 특화된 바이크를 추천해드립니다.',
    specialties: ['어드벤처', '투어러', '크루저'],
    recentProperties: [
      { id: 6, title: '2023 BMW R 1250 GS Adventure', price: 35000000, image: '/img/logo/BMWMotorrad.jpg' },
      { id: 7, title: '2022 Harley-Davidson Street Glide', price: 28000000, image: '/img/logo/PWcsAzP2m-HarleyDavidson.svg' },
    ],
    languages: ['한국어', '영어', '독일어'],
    experience: '15년',
    certifications: ['오토바이 딜러 자격증', '정비사 자격증', 'BMW 공인 딜러'],
  },
  {
    id: 4,
    name: '최듀카티',
    company: '대구프리미엄',
    avatar: '/img/logo/Ducati.webp',
    location: '대구시 수성구',
    rating: 4.7,
    reviewCount: 156,
    propertyCount: 18,
    isVerified: true,
    phone: '010-4567-8901',
    email: 'choi.ducati@daegu.com',
    description: '프리미엄 스포츠바이크 전문 딜러입니다. 듀카티, BMW, KTM 등 고급 브랜드를 취급합니다.',
    specialties: ['프리미엄 스포츠바이크', '레이싱', '커스텀'],
    recentProperties: [
      { id: 8, title: '2020 Ducati Panigale V4', price: 40000000, image: '/img/logo/Ducati.webp' },
      { id: 9, title: '2023 KTM 1290 Super Duke', price: 32000000, image: '/img/logo/kTm.jpeg' },
    ],
    languages: ['한국어', '이탈리아어'],
    experience: '12년',
    certifications: ['오토바이 딜러 자격증', '듀카티 공인 딜러'],
  },
  {
    id: 5,
    name: '정전기',
    company: '전기바이크스토어',
    avatar: '/img/typeany/electric.png',
    location: '서울시 마포구',
    rating: 4.5,
    reviewCount: 67,
    propertyCount: 8,
    isVerified: true,
    phone: '010-5678-9012',
    email: 'jung.electric@evbike.com',
    description: '전기 오토바이 전문 딜러입니다. 친환경이고 경제적인 전기바이크를 추천해드립니다.',
    specialties: ['전기바이크', '하이브리드', '친환경'],
    recentProperties: [
      { id: 10, title: '2023 Zero SR/F Electric', price: 28000000, image: '/img/typeany/electric.png' },
      { id: 11, title: '2022 Harley-Davidson LiveWire', price: 35000000, image: '/img/logo/PWcsAzP2m-HarleyDavidson.svg' },
    ],
    languages: ['한국어', '영어'],
    experience: '6년',
    certifications: ['전기차 전문가 자격증', '오토바이 딜러 자격증'],
  },
  {
    id: 6,
    name: '한케이티엠',
    company: '인천오프로드',
    avatar: '/img/logo/kTm.jpeg',
    location: '인천시 연수구',
    rating: 4.3,
    reviewCount: 45,
    propertyCount: 6,
    isVerified: false,
    phone: '010-6789-0123',
    email: 'han.ktm@incheon.com',
    description: '오프로드 바이크 전문 딜러입니다. 더트바이크와 엔듀로 바이크를 취급합니다.',
    specialties: ['더트바이크', '엔듀로', '오프로드'],
    recentProperties: [
      { id: 12, title: '2021 KTM 390 Duke', price: 8500000, image: '/img/logo/kTm.jpeg' },
      { id: 13, title: '2022 KTM 450 EXC', price: 12000000, image: '/img/logo/kTm.jpeg' },
    ],
    languages: ['한국어'],
    experience: '4년',
    certifications: ['오토바이 딜러 자격증'],
  },
];

const AgentList: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  // 필터링된 agent 목록
  const filteredAgents = useMemo(() => {
    let filtered = mockAgents;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 지역 필터링
    if (selectedLocation) {
      filtered = filtered.filter(agent => agent.location.includes(selectedLocation));
    }

    // 전문분야 필터링
    if (selectedSpecialty) {
      filtered = filtered.filter(agent => 
        agent.specialties.some(specialty => specialty.includes(selectedSpecialty))
      );
    }

    // 정렬
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'property-count':
        filtered.sort((a, b) => b.propertyCount - a.propertyCount);
        break;
      case 'review-count':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'experience':
        filtered.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [searchTerm, selectedLocation, selectedSpecialty, sortBy]);

  const handleContact = (agent: any) => {
    setSelectedAgent(agent);
    setContactDialogOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const locations = [...new Set(mockAgents.map(agent => agent.location.split(' ')[0]))];
  const specialties = [...new Set(mockAgents.flatMap(agent => agent.specialties))];

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('Agents')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('Professional agents who have registered properties')} {filteredAgents.length}명을 찾았습니다
        </Typography>
      </Box>

      {/* 검색 및 필터 바 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder={t('Search by agent name or company')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('Area')}</InputLabel>
              <Select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                label={t('Area')}
              >
                <MenuItem value="">{t('All')}</MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location} value={location}>{location}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>전문분야</InputLabel>
              <Select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                label="전문분야"
              >
                <MenuItem value="">전체</MenuItem>
                {specialties.map((specialty) => (
                  <MenuItem key={specialty} value={specialty}>{specialty}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>정렬</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="정렬"
              >
                <MenuItem value="rating">평점순</MenuItem>
                <MenuItem value="property-count">매물수순</MenuItem>
                <MenuItem value="review-count">리뷰수순</MenuItem>
                <MenuItem value="experience">경력순</MenuItem>
                <MenuItem value="name">이름순</MenuItem>
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
        </Grid>
      </Paper>

      {/* Agent 목록 */}
      <Grid container spacing={3}>
        {filteredAgents.map((agent) => (
          <Grid item xs={12} md={viewMode === 'grid' ? 6 : 12} key={agent.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: viewMode === 'grid' ? 'column' : 'row' }}>
              <CardMedia
                component="img"
                sx={{
                  width: viewMode === 'grid' ? '100%' : 200,
                  height: viewMode === 'grid' ? 200 : 'auto',
                  objectFit: 'cover',
                }}
                image={agent.avatar}
                alt={agent.name}
              />
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" component="h2">
                        {agent.name}
                      </Typography>
                      {agent.isVerified && (
                        <VerifiedIcon color="primary" sx={{ fontSize: '1.2rem' }} />
                      )}
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary">
                      {agent.company}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={agent.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2">
                        {agent.rating}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      리뷰 {agent.reviewCount}개
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationIcon sx={{ fontSize: 'small' }} />
                    <Typography variant="body2">{agent.location}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BikeIcon sx={{ fontSize: 'small' }} />
                    <Typography variant="body2">매물 {agent.propertyCount}개</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonIcon sx={{ fontSize: 'small' }} />
                    <Typography variant="body2">경력 {agent.experience}</Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                  {agent.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  {agent.specialties.map((specialty, index) => (
                    <Chip key={index} label={specialty} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<MessageIcon />}
                    onClick={() => handleContact(agent)}
                    fullWidth
                  >
                    연락하기
                  </Button>
                  <Button variant="outlined" fullWidth>
                    매물보기
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredAgents.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            검색 조건에 맞는 에이전트가 없습니다.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            다른 검색 조건을 시도해보세요.
          </Typography>
        </Box>
      )}

      {/* 연락처 다이얼로그 */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>에이전트 연락처</DialogTitle>
        <DialogContent>
          {selectedAgent && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar src={selectedAgent.avatar} sx={{ width: 60, height: 60 }} />
                <Box>
                  <Typography variant="h6">{selectedAgent.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedAgent.company}</Typography>
                </Box>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <PhoneIcon />
                  </ListItemAvatar>
                  <ListItemText primary="전화번호" secondary={selectedAgent.phone} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <EmailIcon />
                  </ListItemAvatar>
                  <ListItemText primary="이메일" secondary={selectedAgent.email} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <LocationIcon />
                  </ListItemAvatar>
                  <ListItemText primary="위치" secondary={selectedAgent.location} />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                최근 매물
              </Typography>
              <Grid container spacing={1}>
                {selectedAgent.recentProperties.slice(0, 3).map((property: any) => (
                  <Grid item xs={12} sm={4} key={property.id}>
                    <Card sx={{ p: 1 }}>
                      <CardMedia
                        component="img"
                        height="60"
                        image={property.image}
                        alt={property.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <Typography variant="caption" noWrap>
                        {property.title}
                      </Typography>
                      <Typography variant="caption" color="primary" display="block">
                        {formatPrice(property.price)}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentList; 