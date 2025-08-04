import React from 'react';
import { Box, Typography, Container, Grid, Card, CardMedia, CardContent, Button } from '@mui/material';

const SuggestedBikes: React.FC = () => {
  const suggestedBikes = [
    {
      id: 1,
      name: 'Mountain Bike Pro',
      image: '/img/typeImages/type1.png',
      price: '$1,299',
      category: 'Mountain'
    },
    {
      id: 2,
      name: 'Road Bike Elite',
      image: '/img/typeImages/type2.png',
      price: '$2,199',
      category: 'Road'
    },
    {
      id: 3,
      name: 'City Cruiser',
      image: '/img/typeImages/type3.png',
      price: '$899',
      category: 'City'
    },
    {
      id: 4,
      name: 'Electric Commuter',
      image: '/img/typeImages/type4.png',
      price: '$3,499',
      category: 'Electric'
    }
  ];

  return (
    <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
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
          Suggested bikes for you
        </Typography>
        
        <Grid container spacing={4}>
          {suggestedBikes.map((bike) => (
            <Grid item xs={12} sm={6} md={3} key={bike.id}>
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
                  image={bike.image}
                  alt={bike.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {bike.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {bike.category}
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {bike.price}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    View Details
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

export default SuggestedBikes; 