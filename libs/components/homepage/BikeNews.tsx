import React from 'react';
import { Box, Typography, Container, Grid, Card, CardMedia, CardContent, Button, Chip } from '@mui/material';

const BikeNews: React.FC = () => {
  const bikeNews = [
    {
      id: 1,
      title: 'New Electric Bike Technology Revolutionizes Commuting',
      image: '/img/home/home2.jpg',
      excerpt: 'Latest developments in electric bike technology are making urban commuting faster and more eco-friendly than ever before.',
      category: 'Technology',
      date: '2024-01-15',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'Mountain Biking Trails: Top Destinations for 2024',
      image: '/img/home/home3.jpg',
      excerpt: 'Discover the most exciting mountain biking trails and destinations that should be on every rider\'s bucket list this year.',
      category: 'Travel',
      date: '2024-01-12',
      readTime: '8 min read'
    },
    {
      id: 3,
      title: 'Sustainable Materials in Modern Bike Manufacturing',
      image: '/img/typeImages/type1.png',
      excerpt: 'How bike manufacturers are incorporating sustainable materials to create environmentally friendly bicycles.',
      category: 'Sustainability',
      date: '2024-01-10',
      readTime: '6 min read'
    }
  ];

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
          Bike news
        </Typography>
        
        <Grid container spacing={4}>
          {bikeNews.map((news) => (
            <Grid item xs={12} md={4} key={news.id}>
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
                <CardMedia
                  component="img"
                  height="200"
                  image={news.image}
                  alt={news.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip 
                      label={news.category} 
                      color="secondary" 
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {news.readTime}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" component="h3" gutterBottom>
                    {news.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {news.excerpt}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(news.date).toLocaleDateString()}
                    </Typography>
                    <Button
                      variant="text"
                      color="primary"
                      size="small"
                    >
                      Read More
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default BikeNews; 