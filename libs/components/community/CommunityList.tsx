import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
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
  CircularProgress,
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
import { useRouter } from 'next/router';
import { GET_BOARD_ARTICLES, GET_BOARD_ARTICLE } from '../../../apollo/user/query';
import { CREATE_BOARD_ARTICLE, LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { BoardArticle } from '../../../libs/types/board-article/board-article';
import { BoardArticleCategory } from '../../../libs/enums/board-article.enum';
import { sweetErrorAlert } from '../../../libs/sweetAlert';

const CommunityList: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  
  // 게시판 카테고리 (번역 키 사용) - useMemo로 번역 실시간 업데이트
  const categories = useMemo(() => [
    { id: 'ALL', name: t('All Board'), icon: <TrendingUpIcon />, color: '#666666' },
    { id: BoardArticleCategory.FREE, name: t('Free Board'), icon: <PersonIcon />, color: '#2196f3' },
    { id: BoardArticleCategory.REVIEW, name: t('Review Board'), icon: <StarIcon />, color: '#ff9800' },
    { id: BoardArticleCategory.MAINTENANCE, name: t('Maintenance Board'), icon: <BuildIcon />, color: '#4caf50' },
    { id: BoardArticleCategory.TOURING, name: t('Touring Board'), icon: <MapIcon />, color: '#9c27b0' },
    { id: BoardArticleCategory.TRADE, name: t('Trade Board'), icon: <SellIcon />, color: '#f44336' },
    { id: BoardArticleCategory.MEETING, name: t('Meeting Board'), icon: <EventIcon />, color: '#00bcd4' },
    { id: BoardArticleCategory.QNA, name: t('Q&A Board'), icon: <HelpIcon />, color: '#795548' },
    { id: BoardArticleCategory.RECOMMEND, name: t('Recommend Board'), icon: <StarIcon />, color: '#ff9800' },
    { id: BoardArticleCategory.NEWS, name: t('News Board'), icon: <NewReleasesIcon />, color: '#4caf50' },
    { id: BoardArticleCategory.HUMOR, name: t('Humor Board'), icon: <TrendingUpIcon />, color: '#9c27b0' },
  ], [t]);

  // 정렬 옵션 - useMemo로 번역 실시간 업데이트
  const sortOptions = useMemo(() => [
    { value: 'LATEST', label: t('Latest') },
    { value: 'POPULAR', label: t('Popular') },
    { value: 'VIEWS', label: t('Views') },
    { value: 'COMMENTS', label: t('Comments') },
    { value: 'LIKES', label: t('Likes') },
  ], [t]);
  
  // 상태 관리
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState('LATEST');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [newArticle, setNewArticle] = useState({
    articleCategory: BoardArticleCategory.FREE,
    articleTitle: '',
    articleContent: '',
    articleImage: '', // 필수 필드 추가
  });

  // GraphQL 쿼리
  const { loading, error, data, refetch } = useQuery(GET_BOARD_ARTICLES, {
    variables: {
      input: {
        page,
        limit,
        sortBy,
        search: {
          articleCategory: selectedCategory === 'ALL' ? undefined : selectedCategory,
          text: searchTerm,
        }
      }
    },
    fetchPolicy: 'cache-and-network',
  });

  // 뮤테이션
  const [createArticle] = useMutation(CREATE_BOARD_ARTICLE);
  const [likeArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

  // 데이터 처리
  const articles = data?.getBoardArticles?.list || [];
  const totalCount = data?.getBoardArticles?.metaCounter?.[0]?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);

  // 좋아요 처리
  const handleLike = async (articleId: string) => {
    try {
      await likeArticle({
        variables: { input: articleId },
        refetchQueries: [{ query: GET_BOARD_ARTICLES, variables: { input: { page, limit, sortBy, search: { articleCategory: selectedCategory, text: searchTerm } } } }]
      });
    } catch (error) {
      sweetErrorAlert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  // 게시글 작성
  const handleCreateArticle = async () => {
    try {
      await createArticle({
        variables: { input: newArticle },
        refetchQueries: [{ query: GET_BOARD_ARTICLES, variables: { input: { page, limit, sortBy, search: { articleCategory: selectedCategory === 'ALL' ? undefined : selectedCategory, text: searchTerm } } } }]
      });
      setOpenCreateDialog(false);
      setNewArticle({
        articleCategory: BoardArticleCategory.FREE,
        articleTitle: '',
        articleContent: '',
        articleImage: '', // 필수 필드 추가
      });
    } catch (error) {
      sweetErrorAlert('게시글 작성 중 오류가 발생했습니다.');
    }
  };

  // 게시글 클릭
  const handleArticleClick = (articleId: string) => {
    router.push(`/community/${articleId}`);
  };

  // 게시글 확장/축소 토글
  const handleArticleExpand = (articleId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // 부모 클릭 이벤트 방지
    setExpandedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  // 게시글 내용 길이 확인
  const isContentLong = (content: string) => {
    return content.length > 150;
  };

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}시간 전`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  // 카테고리 변경 시 페이지 리셋
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, sortBy, searchTerm]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t('Error loading articles')}: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('Community')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('Motorcycle Riders Communication Space')}
        </Typography>
      </Box>

      {/* 검색 및 필터 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder={t('Search by title, content, author')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('Sort by')}</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label={t('Sort by')}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              {t('Write Post')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 카테고리 탭 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedCategory}
          onChange={(_, newValue) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((category) => (
            <Tab
              key={category.id}
              value={category.id}
              label={category.name}
              icon={category.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* 게시글 목록 */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2, alignSelf: 'center' }}>
            {t('Loading articles')}
          </Typography>
        </Box>
      ) : articles.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('No posts found')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('Try different search criteria')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {articles.map((article: BoardArticle) => (
            <Grid item xs={12} key={article._id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 3 }
                }}
                onClick={() => handleArticleClick(article._id)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={categories.find(c => c.id === article.articleCategory)?.name || '기타'}
                      size="small"
                      sx={{ 
                        backgroundColor: categories.find(c => c.id === article.articleCategory)?.color || '#666666',
                        color: 'white'
                      }}
                    />
                                                                    {article.memberData?.memberType === 'EXPERT' as any && (
                         <Chip
                           label={t('Expert')}
                           size="small"
                           color="warning"
                         />
                       )}
                    </Box>
                                         <Typography variant="caption" color="text.secondary">
                       {formatTime(article.createdAt.toString())}
                     </Typography>
                  </Box>

                  <Typography variant="h6" component="h2" gutterBottom>
                    {article.articleTitle}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {expandedArticles.has(article._id) 
                      ? article.articleContent
                      : article.articleContent.substring(0, 150) + (isContentLong(article.articleContent) ? '...' : '')
                    }
                  </Typography>
                  
                  {isContentLong(article.articleContent) && (
                    <Button
                      size="small"
                      onClick={(e) => handleArticleExpand(article._id, e)}
                      sx={{ mb: 2, textTransform: 'none' }}
                    >
                      {expandedArticles.has(article._id) ? t('Read Less') : t('Read More')}
                    </Button>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={article.memberData?.memberImage}
                          sx={{ width: 24, height: 24 }}
                        >
                          {article.memberData?.memberNick?.charAt(0)}
                        </Avatar>
                                                 <Typography variant="body2">
                           {article.memberData?.memberNick || t('Anonymous')}
                         </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {article.articleViews}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ThumbUpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {article.articleLikes}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {article.articleComments}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            sx={{ mr: 1 }}
          >
            {t('Previous')}
          </Button>
          <Typography sx={{ mx: 2, alignSelf: 'center' }}>
            {t('Page')} {page} {t('of')} {totalPages}
          </Typography>
          <Button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            sx={{ ml: 1 }}
          >
            {t('Next')}
          </Button>
        </Box>
      )}

      {/* 게시글 작성 다이얼로그 */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('Create New Article')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('Select Category')}</InputLabel>
              <Select
                value={newArticle.articleCategory}
                onChange={(e) => setNewArticle({...newArticle, articleCategory: e.target.value as BoardArticleCategory})}
                label={t('Select Category')}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label={t('Article Title')}
              placeholder={t('Enter article title')}
              value={newArticle.articleTitle}
              onChange={(e) => setNewArticle({...newArticle, articleTitle: e.target.value})}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={6}
              label={t('Article Content')}
              placeholder={t('Enter article content')}
              value={newArticle.articleContent}
              onChange={(e) => setNewArticle({...newArticle, articleContent: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            onClick={handleCreateArticle}
            variant="contained"
            disabled={!newArticle.articleTitle.trim() || !newArticle.articleContent.trim()}
          >
            {t('Write Article')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunityList; 