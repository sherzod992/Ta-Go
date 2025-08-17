import React, { useState, useMemo } from 'react';
import { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BOARD_ARTICLE, GET_COMMENTS } from '../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE, CREATE_COMMENT, DELETE_COMMENT, LIKE_COMMENT } from '../../apollo/user/mutation';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Comment, CommentSortBy } from '../../libs/types/comment/comment';
import YouTubeStyleComments from '../../libs/components/community/YouTubeStyleComments';

interface CommunityDetailPageProps {
  id: string;
}

const CommunityDetailPage: NextPage<CommunityDetailPageProps> = ({ id }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [commentSortBy, setCommentSortBy] = useState<CommentSortBy>(CommentSortBy.NEWEST);

  // 게시판 카테고리 (번역 키 사용) - useMemo로 번역 실시간 업데이트
  const categories = useMemo(() => [
    { id: BoardArticleCategory.FREE, name: t('Free Board'), icon: '💬', color: '#2196f3' },
    { id: BoardArticleCategory.REVIEW, name: t('Review Board'), icon: '⭐', color: '#ff9800' },
    { id: BoardArticleCategory.MAINTENANCE, name: t('Maintenance Board'), icon: '🔧', color: '#4caf50' },
    { id: BoardArticleCategory.TOURING, name: t('Touring Board'), icon: '🗺️', color: '#9c27b0' },
    { id: BoardArticleCategory.TRADE, name: t('Trade Board'), icon: '💰', color: '#f44336' },
    { id: BoardArticleCategory.MEETING, name: t('Meeting Board'), icon: '👥', color: '#00bcd4' },
    { id: BoardArticleCategory.QNA, name: t('Q&A Board'), icon: '❓', color: '#795548' },
    { id: BoardArticleCategory.RECOMMEND, name: t('Recommend Board'), icon: '👍', color: '#ff9800' },
    { id: BoardArticleCategory.NEWS, name: t('News Board'), icon: '📰', color: '#4caf50' },
    { id: BoardArticleCategory.HUMOR, name: t('Humor Board'), icon: '😄', color: '#9c27b0' },
  ], [t]);

  // 게시글 조회
  const { data: articleData, loading: articleLoading, error: articleError, refetch: refetchArticle } = useQuery(GET_BOARD_ARTICLE, {
    variables: { input: id },
    fetchPolicy: 'cache-and-network',
  });

  const article = articleData?.getBoardArticle;

  // 댓글 조회
  const { data: commentsData, loading: commentsLoading, error: commentsError, refetch: refetchComments } = useQuery(GET_COMMENTS, {
    variables: { 
      input: {
        page: 1,
        limit: 50,
        sort: commentSortBy,
        search: {
          commentRefId: article?._id || id
        }
      }
    },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all', // 에러가 있어도 데이터를 표시
    skip: !article?._id, // 게시글이 로드된 후에만 댓글 조회
  });

  // 좋아요 뮤테이션
  const [likeArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE, {
    onCompleted: () => {
      refetchArticle();
    },
    onError: (error) => {
      console.error('좋아요 실패:', error);
    }
  });

  // 댓글 작성 뮤테이션
  const [createComment, { loading: commentLoading }] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      refetchComments();
      refetchArticle(); // 댓글 수 업데이트를 위해 게시글도 새로고침
    },
    onError: (error) => {
      console.error('댓글 작성 실패:', error);
    }
  });

  // 댓글 삭제 뮤테이션
  const [deleteComment] = useMutation(DELETE_COMMENT, {
    onCompleted: () => {
      refetchComments();
      refetchArticle(); // 댓글 수 업데이트를 위해 게시글도 새로고침
    },
    onError: (error) => {
      console.error('댓글 삭제 실패:', error);
    }
  });

  // 댓글 좋아요 뮤테이션
  const [likeComment] = useMutation(LIKE_COMMENT, {
    onCompleted: () => {
      refetchComments();
    },
    onError: (error) => {
      console.error('댓글 좋아요 실패:', error);
    }
  });
  const comments = commentsData?.getComments?.list || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  const handleLike = () => {
    if (article) {
      likeArticle({
        variables: { input: article._id }
      });
    }
  };

  const handleCommentSubmit = (content: string, parentId?: string) => {
    if (!content.trim() || !article) return;

    createComment({
      variables: {
        input: {
          commentContent: content,
          commentRefId: article._id,
          commentGroup: CommentGroup.ARTICLE,
          parentCommentId: parentId,
        }
      }
    });
  };

  const handleCommentDelete = (commentId: string) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      deleteComment({
        variables: { input: commentId }
      });
    }
  };

  const handleCommentLike = (commentId: string) => {
    likeComment({
      variables: { input: commentId }
    });
  };

  const handleSortChange = (sortBy: CommentSortBy) => {
    setCommentSortBy(sortBy);
  };

  if (articleLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (articleError) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2, py: 4 }}>
        <Alert severity="error">
          게시글을 불러오는 중 오류가 발생했습니다: {articleError.message}
        </Alert>
      </Box>
    );
  }

  if (!article) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          {t('Article not found')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* 뒤로가기 버튼 */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 3 }}
      >
        {t('Back to List')}
      </Button>

      {/* 게시글 헤더 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Chip
              label={getCategoryInfo(article.articleCategory).name}
              size="small"
              sx={{ backgroundColor: getCategoryInfo(article.articleCategory).color, color: 'white' }}
            />
            {article.memberData?.memberType === 'AGENT' && (
              <Chip
                label={t('Expert')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>

          <Typography variant="h4" component="h1" gutterBottom>
            {article.articleTitle}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={article.memberData?.memberImage} sx={{ width: 32, height: 32 }} />
              <Typography variant="body1" fontWeight="bold">
                {article.memberData?.memberNick || t('Anonymous')}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {formatDate(article.createdAt.toString())}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityIcon sx={{ fontSize: 'small' }} />
              <Typography variant="body2">{article.articleViews}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ThumbUpIcon 
                sx={{ 
                  fontSize: 'small',
                  color: article.meLiked?.length > 0 
                    ? 'primary.main' 
                    : 'action.active'
                }} 
              />
              <Typography 
                variant="body2"
                sx={{
                  color: article.meLiked?.length > 0 
                    ? 'primary.main' 
                    : 'text.primary',
                  fontWeight: article.meLiked?.length > 0 
                    ? 'bold' 
                    : 'normal'
                }}
              >
                {article.articleLikes}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CommentIcon sx={{ fontSize: 'small' }} />
              <Typography variant="body2">{article.articleComments}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              color={article.meLiked?.length > 0 ? 'primary' : 'default'}
              onClick={handleLike}
              sx={{
                '&:hover': {
                  backgroundColor: article.meLiked?.length > 0 
                    ? 'primary.light' 
                    : 'action.hover'
                }
              }}
            >
              <ThumbUpIcon 
                sx={{
                  color: article.meLiked?.length > 0 
                    ? 'primary.main' 
                    : 'action.active'
                }}
              />
            </IconButton>
            <IconButton>
              <BookmarkIcon />
            </IconButton>
            <IconButton>
              <ShareIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* 게시글 내용 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {article.articleImage && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <img
                src={article.articleImage}
                alt="게시글 이미지"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: 400, 
                  objectFit: 'contain',
                  borderRadius: 8 
                }}
              />
            </Box>
          )}

          <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {article.articleContent}
          </Typography>
        </CardContent>
      </Card>

      {/* 유튜브 스타일 댓글 시스템 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            댓글 ({article.articleComments})
          </Typography>
          
          <YouTubeStyleComments
            comments={comments}
            loading={commentsLoading}
            error={commentsError}
            onCommentSubmit={handleCommentSubmit}
            onCommentLike={handleCommentLike}
            onCommentDelete={handleCommentDelete}
            commentLoading={commentLoading}
            sortBy={commentSortBy}
            onSortChange={handleSortChange}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
  const id = params?.id as string;

  return {
    props: {
      id,
      ...(await serverSideTranslations(locale || 'ko', ['common'])),
    },
  };
};

export default withLayoutBasic(CommunityDetailPage);
