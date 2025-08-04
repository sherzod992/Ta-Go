import React from 'react';
import { Box, Container } from '@mui/material';
import HeroSection from './HeroSection';
import SuggestedBikes from './SuggestedBikes';
import NewBikeShowroom from './NewBikeShowroom';
import ExpertReviews from './ExpertReviews';
import BikeNews from './BikeNews';

const HomePage: React.FC = () => {
  return (
    <Box>
      <Container maxWidth="xl" sx={{ padding: 0 }}>
        <HeroSection />
        <SuggestedBikes />
        <NewBikeShowroom />
        <ExpertReviews />
        <BikeNews />
      </Container>
    </Box>
  );
};

export default HomePage; 