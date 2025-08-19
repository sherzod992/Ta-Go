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

const NewBikeShowroom: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  
  // GraphQL 쿼리로 신차 매물 데이터 가져오기
  const { data, loading, error } = useQuery(GET_PROPERTIES, {
    variables: {
      input: {
        page: 1,
        limit: 3,
        search: {
          propertyStatus: 'ACTIVE',
          propertyCondition: 'NEW'
        }
      }
    },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  const newBikes = data?.getProperties?.list || [];

  // 로딩 상태 처리
  if (loading) {
    return (
      <Box sx={{ py: 8, backgroundColor: 'white', textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t('Loading new bikes...')}
        </Typography>
      </Box>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <Box sx={{ py: 8, backgroundColor: 'white' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('Failed to load new bikes. Please try again later.')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8, backgroundColor: 'white' }}>
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
          {t('New Bike Showroom')}
        </Typography>
        
        {newBikes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {t('No new bikes available at the moment')}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {newBikes.map((bike: any) => (
              <Grid item xs={12} md={4} key={bike._id}>
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
                  onClick={() => router.push(`/property/${bike._id}`)}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    image={bike.propertyImages?.[0] || '/img/logo/Honda_Logo.svg'}
                    alt={bike.propertyTitle}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {bike.propertyTitle}
                    </Typography>
                    
                    <Typography variant="h4" color="primary" gutterBottom>
                      {new Intl.NumberFormat('ko-KR').format(bike.propertyPrice)}원
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="body1" color="text.secondary">
                        {bike.propertyLocation}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {bike.propertyYear}년
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/property/${bike._id}`);
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

export default NewBikeShowroom; 