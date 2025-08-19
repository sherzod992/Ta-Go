import React from 'react';
import { useTranslation } from 'next-i18next';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Rating,
  Chip
} from '@mui/material';

const ExpertReviews: React.FC = () => {
  const { t } = useTranslation('common');

  // 모의 리뷰 데이터
  const reviews = [
    {
      id: 1,
      name: '김바이커',
      avatar: '/img/logo/Honda_Logo.svg',
      rating: 5,
      title: 'Honda CB650R - 완벽한 도시 라이딩',
      content: '도시에서의 일상적인 라이딩에 완벽한 바이크입니다. 연비도 좋고 관리도 쉽습니다.',
      category: 'Sport'
    },
    {
      id: 2,
      name: '박투어러',
      avatar: '/img/logo/BMWMotorrad.jpg',
      rating: 5,
      title: 'BMW R1250GS - 장거리 투어링의 정석',
      content: '장거리 투어링에 최적화된 바이크입니다. 편안한 라이딩 포지션과 뛰어난 안정성을 제공합니다.',
      category: 'Adventure'
    },
    {
      id: 3,
      name: '이크루저',
      avatar: '/img/logo/PWcsAzP2m-HarleyDavidson.svg',
      rating: 4,
      title: 'Harley-Davidson Street Glide - 클래식의 매력',
      content: '클래식한 디자인과 강력한 엔진 사운드가 매력적입니다. 장거리 라이딩에도 적합합니다.',
      category: 'Cruiser'
    }
  ];

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
          {t('Expert Reviews')}
        </Typography>
        
        <Grid container spacing={4}>
          {reviews.map((review) => (
            <Grid item xs={12} md={4} key={review.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={review.avatar}
                      sx={{ width: 50, height: 50, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6" component="h3">
                        {review.name}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>
                  </Box>
                  
                  <Chip 
                    label={review.category} 
                    color="primary" 
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="h6" component="h4" gutterBottom>
                    {review.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {review.content}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ExpertReviews; 