import React from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Button, 
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';

const BikeNews: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  
  // GraphQL 쿼리로 최신 게시글 데이터 가져오기
  const { data, loading, error } = useQuery(GET_BOARD_ARTICLES, {
    variables: {
      input: {
        page: 1,
        limit: 3,
        search: {
          articleStatus: 'ACTIVE'
        }
      }
    },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  const articles = data?.getBoardArticles?.list || [];

  // 로딩 상태 처리
  if (loading) {
    return (
      <Box sx={{ py: 8, backgroundColor: 'white', textAlign: 'center' }}>
        <Container maxWidth="lg">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t('Loading latest news...')}
          </Typography>
        </Container>
      </Box>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <Box sx={{ py: 8, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mb: 2 }}>
            {t('Failed to load latest news. Please try again later.')}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8, backgroundColor: 'white' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
            marginBottom: 4,
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          {t('Latest News')}
        </Typography>
        
        {articles.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {t('No news available at the moment')}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {articles.map((article: any) => (
              <Grid item xs={12} md={4} key={article._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={() => router.push(`/community/${article._id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={article.articleImage || '/img/home/home2.jpg'}
                    alt={article.articleTitle}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip 
                        label={article.articleCategory} 
                        color="secondary" 
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {article.articleViews} {t('views')}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" component="h3" gutterBottom>
                      {article.articleTitle}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {article.articleContent?.substring(0, 100)}...
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </Typography>
                                          <Button
                      variant="text"
                      color="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/community/${article._id}`);
                      }}
                    >
                      {t('Read more')}
                    </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default BikeNews; 