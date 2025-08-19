import React from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { PropertyType } from '../../enums/property.enum';

const SuggestedBikes: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  
  // GraphQL 쿼리로 추천 매물 데이터 가져오기
  const { data, loading, error } = useQuery(GET_PROPERTIES, {
    variables: {
      input: {
        page: 1,
        limit: 4,
        search: {
          propertyStatus: 'ACTIVE'
        }
      }
    },
    fetchPolicy: 'cache-and-network', // 캐시 최적화
    errorPolicy: 'all' // 에러가 있어도 부분 데이터 표시
  });

  const properties = data?.getProperties?.list || [];

  // 로딩 상태 처리
  if (loading) {
    return (
      <Box sx={{ py: 8, backgroundColor: '#f8f9fa', textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t('Loading suggested bikes...')}
        </Typography>
      </Box>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('Failed to load suggested bikes. Please try again later.')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: 3 }}>
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
            marginBottom: 4,
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          {t('Suggested bikes for you')}
        </Typography>
        
        {properties.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {t('No bikes available at the moment')}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {properties.map((property: any) => (
              <Grid item xs={12} sm={6} md={3} key={property._id}>
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
                  onClick={() => router.push(`/property/${property._id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={property.propertyImages?.[0] || '/img/logo/Honda_Logo.svg'}
                    alt={property.propertyTitle}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {property.propertyTitle}
                    </Typography>
                    
                    <Typography variant="h5" color="primary" gutterBottom>
                      {new Intl.NumberFormat('ko-KR').format(property.propertyPrice)}원
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {property.propertyLocation}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {property.propertyYear}년
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/property/${property._id}`);
                      }}
                    >
                      {t('View Details')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default SuggestedBikes; 