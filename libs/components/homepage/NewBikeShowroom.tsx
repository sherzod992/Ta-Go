import React from 'react';
import { Box, Typography, Container, Grid, Card, CardMedia, CardContent, Button } from '@mui/material';

const NewBikeShowroom: React.FC = () => {
  const newBikes = [
    {
      id: 1,
      name: '2024 Speed Demon',
      image: '/img/typeImages/type5.png',
      price: '$4,299',
      description: 'Latest technology with premium features'
    },
    {
      id: 2,
      name: 'Urban Explorer',
      image: '/img/typeImages/type6.png',
      price: '$2,899',
      description: 'Perfect for city adventures'
    },
    {
      id: 3,
      name: 'Trail Master',
      image: '/img/typeImages/dirt-bikes.png',
      price: '$3,599',
      description: 'Built for rugged terrain'
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
          New bike showroom
        </Typography>
        
        <Grid container spacing={4}>
          {newBikes.map((bike) => (
            <Grid item xs={12} md={4} key={bike.id}>
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
                  height="250"
                  image={bike.image}
                  alt={bike.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {bike.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {bike.description}
                  </Typography>
                  <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
                    {bike.price}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Explore Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default NewBikeShowroom; 