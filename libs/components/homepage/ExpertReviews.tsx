import React from 'react';
import { useTranslation } from 'next-i18next';
import { Box, Typography, Container, Grid, Card, CardContent, Avatar, Rating, Chip } from '@mui/material';

const ExpertReviews: React.FC = () => {
  const { t } = useTranslation('common');
  const expertReviews = [
    {
      id: 1,
      bikeName: 'Mountain Pro X1',
      expertName: 'Alex Johnson',
      expertImage: '/img/typeImages/standart-naket.avif',
      rating: 4.8,
      review: 'Exceptional performance on rough terrain. The suspension system is outstanding.',
      category: 'Mountain'
    },
    {
      id: 2,
      bikeName: 'Road Elite S2',
      expertName: 'Sarah Chen',
      expertImage: '/img/typeImages/standart-naket.avif',
      rating: 4.9,
      review: 'Incredible speed and precision. Perfect for competitive racing.',
      category: 'Road'
    },
    {
      id: 3,
      bikeName: 'City Cruiser Plus',
      expertName: 'Mike Rodriguez',
      expertImage: '/img/typeImages/standart-naket.avif',
      rating: 4.7,
      review: 'Comfortable and reliable for daily commuting. Great value for money.',
      category: 'City'
    }
  ];

  return (
    <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
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
        {expertReviews.map((review) => (
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
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={review.expertImage}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6" component="h3">
                      {review.expertName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('Expert')}
                    </Typography>
                  </Box>
                </Box>
                
                <Chip 
                  label={review.category} 
                  color="primary" 
                  size="small" 
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="h6" component="h4" gutterBottom>
                  {review.bikeName}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={review.rating} precision={0.1} readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {review.rating}/5
                  </Typography>
                </Box>
                
                <Typography variant="body1" color="text.secondary">
                  "{review.review}"
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ExpertReviews; 