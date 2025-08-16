import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Divider,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  NewReleases as NewReleasesIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  DirectionsBike as BikeIcon,
  Build as BuildIcon,
  Map as MapIcon,
  Event as EventIcon,
  Help as HelpIcon,
  Sell as SellIcon,
  Star as StarIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';

// 게시판 카테고리
const categories = [
  { id: 'FREE', name: '자유게시판', icon: <PersonIcon />, color: '#2196f3' },
  { id: 'REVIEW', name: '리뷰게시판', icon: <StarIcon />, color: '#ff9800' },
  { id: 'MAINTENANCE', name: '정비게시판', icon: <BuildIcon />, color: '#4caf50' },
  { id: 'TOURING', name: '투어링게시판', icon: <MapIcon />, color: '#9c27b0' },
  { id: 'TRADE', name: '중고거래게시판', icon: <SellIcon />, color: '#f44336' },
  { id: 'MEETING', name: '모임게시판', icon: <EventIcon />, color: '#00bcd4' },
  { id: 'QNA', name: '질문게시판', icon: <HelpIcon />, color: '#795548' },
];

// 하드코드된 게시글 데이터
const mockArticles = [
  {
    id: 1,
    category: 'REVIEW',
    title: '2023 BMW R 1250 GS Adventure 3개월 사용 후기',
    content: '3개월간 사용한 BMW R 1250 GS Adventure의 상세한 리뷰입니다. 장거리 투어링에 최적화된 성능과 편의성을 자세히 분석해보았습니다.',
    author: '김투어러',
    authorImage: '/img/logo/BMWMotorrad.jpg',
    isExpert: true,
    likes: 127,
    dislikes: 3,
    comments: 45,
    views: 2340,
    createdAt: '2024-01-15T10:30:00Z',
    tags: ['BMW', '투어러', '장거리', '편의성'],
    isBookmarked: true,
    isLiked: true,
    images: ['/img/logo/BMWMotorrad.jpg'],
  },
  {
    id: 2,
    category: 'MAINTENANCE',
    title: '오토바이 체인 정비 완벽 가이드',
    content: '체인 정비의 모든 것! 체인 세척, 윤활, 장력 조정까지 단계별로 설명합니다. 초보자도 쉽게 따라할 수 있습니다.',
    author: '정비왕',
    authorImage: '/img/logo/Honda_Logo.svg',
    isExpert: true,
    likes: 89,
    dislikes: 1,
    comments: 23,
    views: 1567,
    createdAt: '2024-01-14T15:20:00Z',
    tags: ['정비', '체인', '초보자', '가이드'],
    isBookmarked: false,
    isLiked: false,
    images: [],
  },
  {
    id: 3,
    category: 'TOURING',
    title: '강원도 동해안 라이딩 코스 추천',
    content: '강원도 동해안을 따라가는 아름다운 라이딩 코스를 소개합니다. 바다를 보며 달리는 최고의 경험을 해보세요.',
    author: '라이딩러버',
    authorImage: '/img/logo/yamaha.webp',
    isExpert: false,
    likes: 156,
    dislikes: 2,
    comments: 34,
    views: 2890,
    createdAt: '2024-01-13T09:15:00Z',
    tags: ['라이딩', '강원도', '동해안', '코스'],
    isBookmarked: true,
    isLiked: true,
    images: ['/img/logo/yamaha.webp'],
  },
  {
    id: 4,
    category: 'TRADE',
    title: 'Honda CBR1000RR-R 파이어블레이드 판매합니다',
    content: '2022년식 Honda CBR1000RR-R 파이어블레이드를 판매합니다. 완벽한 상태로 보관되어 있으며, 정기 점검 완료입니다.',
    author: '바이크딜러',
    authorImage: '/img/logo/Honda_Logo.svg',
    isExpert: true,
    likes: 23,
    dislikes: 0,
    comments: 12,
    views: 890,
    createdAt: '2024-01-12T14:45:00Z',
    tags: ['판매', 'Honda', 'CBR1000RR-R', '스포츠바이크'],
    isBookmarked: false,
    isLiked: false,
    images: ['/img/logo/Honda_Logo.svg'],
  },
  {
    id: 5,
    category: 'QNA',
    title: '첫 오토바이 추천 부탁드립니다',
    content: '오토바이 초보자입니다. 125cc 정도의 가벼운 바이크를 추천해주세요. 주로 도시 주행용으로 사용할 예정입니다.',
    author: '초보라이더',
    authorImage: '/img/logo/kTm.jpeg',
    isExpert: false,
    likes: 67,
    dislikes: 1,
    comments: 28,
    views: 1234,
    createdAt: '2024-01-11T11:30:00Z',
    tags: ['초보자', '추천', '125cc', '도시주행'],
    isBookmarked: false,
    isLiked: false,
    images: [],
  },
  {
    id: 6,
    category: 'MEETING',
    title: '서울 강남 라이딩 모임 - 매주 토요일',
    content: '서울 강남 지역 라이딩 모임을 모집합니다. 매주 토요일 오전에 모여서 함께 라이딩하는 모임입니다. 초보자도 환영합니다!',
    author: '강남라이더',
    authorImage: '/img/logo/Ducati.webp',
    isExpert: false,
    likes: 234,
    dislikes: 5,
    comments: 56,
    views: 3456,
    createdAt: '2024-01-10T16:20:00Z',
    tags: ['모임', '서울', '강남', '토요일'],
    isBookmarked: true,
    isLiked: true,
    images: ['/img/logo/Ducati.webp'],
  },
  {
    id: 7,
    category: 'FREE',
    title: '오늘 라이딩하면서 본 아름다운 풍경',
    content: '오늘 라이딩하면서 본 아름다운 풍경을 공유합니다. 오토바이를 타고 다니면서만 볼 수 있는 특별한 순간들이었습니다.',
    author: '풍경사진가',
    authorImage: '/img/logo/BMWMotorrad.jpg',
    isExpert: false,
    likes: 189,
    dislikes: 3,
    comments: 41,
    views: 2789,
    createdAt: '2024-01-09T13:10:00Z',
    tags: ['풍경', '사진', '라이딩', '순간'],
    isBookmarked: false,
    isLiked: true,
    images: ['/img/logo/BMWMotorrad.jpg'],
  },
  {
    id: 8,
    category: 'MAINTENANCE',
    title: '겨울철 오토바이 보관 방법',
    content: '겨울철 오토바이 보관에 대한 완벽한 가이드를 제공합니다. 배터리, 연료, 타이어 등 모든 부분을 체크해보세요.',
    author: '정비전문가',
    authorImage: '/img/logo/Honda_Logo.svg',
    isExpert: true,
    likes: 145,
    dislikes: 2,
    comments: 38,
    views: 1987,
    createdAt: '2024-01-08T10:45:00Z',
    tags: ['겨울', '보관', '정비', '가이드'],
    isBookmarked: true,
    isLiked: false,
    images: [],
  },
];

// 인기 키워드
const trendingKeywords = [
  'BMW R 1250 GS', '체인 정비', '강원도 라이딩', 'Honda CBR', '초보자 추천',
  '라이딩 모임', '겨울 보관', '투어링 코스', '정비 팁', '중고거래'
];

const CommunityList: React.FC = () => {
  const { t } = useTranslation('common');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [writeDialogOpen, setWriteDialogOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    category: 'FREE',
  });

  // 필터링된 게시글 목록
  const filteredArticles = useMemo(() => {
    let filtered = [...mockArticles]; // 배열을 안전하게 복사

    // 카테고리 필터링
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 정렬 (안전한 배열 복사 후 정렬)
    const sortedFiltered = [...filtered];
    switch (sortBy) {
      case 'latest':
        sortedFiltered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        sortedFiltered.sort((a, b) => b.likes - a.likes);
        break;
      case 'views':
        sortedFiltered.sort((a, b) => b.views - a.views);
        break;
      case 'comments':
        sortedFiltered.sort((a, b) => b.comments - a.comments);
        break;
      default:
        sortedFiltered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return sortedFiltered;
  }, [selectedCategory, searchTerm, sortBy]);

  const handleWriteArticle = () => {
    // 글쓰기 로직
    console.log('New article:', newArticle);
    setWriteDialogOpen(false);
    setNewArticle({ title: '', content: '', category: 'FREE' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('Community')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          오토바이 라이더들의 소통 공간
        </Typography>
      </Box>

      {/* 인기 키워드 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon />
          실시간 인기 키워드
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {trendingKeywords.map((keyword, index) => (
            <Chip
              key={index}
              label={keyword}
              size="small"
              variant="outlined"
              onClick={() => setSearchTerm(keyword)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Paper>

      {/* 검색 및 필터 바 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="제목, 내용, 작성자로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="카테고리"
              >
                <MenuItem value="ALL">전체</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
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
                <MenuItem value="latest">최신순</MenuItem>
                <MenuItem value="popular">인기순</MenuItem>
                <MenuItem value="views">조회순</MenuItem>
                <MenuItem value="comments">댓글순</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
            >
              <ToggleButton value="list">
                <NewReleasesIcon />
              </ToggleButton>
              <ToggleButton value="grid">
                <TrendingUpIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setWriteDialogOpen(true)}
              fullWidth
            >
              글쓰기
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 카테고리 탭 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedCategory}
          onChange={(e, newValue) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="전체"
            value="ALL"
            sx={{ minWidth: 100 }}
          />
          {categories.map((category) => (
            <Tab
              key={category.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {category.icon}
                  {category.name}
                </Box>
              }
              value={category.id}
              sx={{ minWidth: 120 }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* 게시글 목록 */}
      <Grid container spacing={3}>
        {filteredArticles.map((article) => (
          <Grid item xs={12} key={article.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={getCategoryInfo(article.category).name}
                        size="small"
                        sx={{ backgroundColor: getCategoryInfo(article.category).color, color: 'white' }}
                      />
                      {article.isExpert && (
                        <Chip
                          label="전문가"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {article.content.substring(0, 150)}...
                    </Typography>
                  </Box>
                  {article.images.length > 0 && (
                    <Box sx={{ ml: 2 }}>
                      <img
                        src={article.images[0]}
                        alt="게시글 이미지"
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                      />
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={article.authorImage} sx={{ width: 24, height: 24 }} />
                    <Typography variant="body2">
                      {article.author}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(article.createdAt)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThumbUpIcon sx={{ fontSize: 'small' }} />
                    <Typography variant="body2">{article.likes}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CommentIcon sx={{ fontSize: 'small' }} />
                    <Typography variant="body2">{article.comments}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VisibilityIcon sx={{ fontSize: 'small' }} />
                    <Typography variant="body2">{article.views}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {article.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" color={article.isLiked ? 'primary' : 'default'}>
                      <ThumbUpIcon />
                    </IconButton>
                    <IconButton size="small" color={article.isBookmarked ? 'primary' : 'default'}>
                      <BookmarkIcon />
                    </IconButton>
                    <IconButton size="small">
                      <ShareIcon />
                    </IconButton>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredArticles.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            검색 조건에 맞는 게시글이 없습니다.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            다른 검색 조건을 시도해보세요.
          </Typography>
        </Box>
      )}

      {/* 글쓰기 다이얼로그 */}
      <Dialog open={writeDialogOpen} onClose={() => setWriteDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>새 글 작성</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>카테고리</InputLabel>
                <Select
                  value={newArticle.category}
                  onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                  label="카테고리"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="제목"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextareaAutosize
                minRows={6}
                placeholder="내용을 입력하세요..."
                value={newArticle.content}
                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWriteDialogOpen(false)}>취소</Button>
          <Button onClick={handleWriteArticle} variant="contained">
            작성하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunityList; 