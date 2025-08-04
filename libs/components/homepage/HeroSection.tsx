import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Button, 
  Chip,
  Paper
} from '@mui/material';

const HeroSection: React.FC = () => {
  const [make, setMake] = useState('all');
  const [model, setModel] = useState('all');
  const [category, setCategory] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('all');
  const [condition, setCondition] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const bikeCategories = [
    { name: 'ATVs/Quads', image: '/img/typeImages/type1.png' },
    { name: 'Cruisers', image: '/img/typeImages/type2.png' },
    { name: 'Dirt Bikes', image: '/img/typeImages/dirt-bikes.png' },
    { name: 'Electric', image: '/img/typeImages/type4.png' },
    { name: 'Learner', image: '/img/typeImages/type3.png' },
    { name: 'Road Bikes', image: '/img/typeImages/type5.png' },
    { name: 'SxS/UTV', image: '/img/typeImages/type6.png' }
  ];

  const handleClearAll = () => {
    setMake('all');
    setModel('all');
    setCategory('all');
    setKeyword('');
    setLocation('all');
    setCondition('all');
    setPriceMin('');
    setPriceMax('');
  };

  return (
    <Box
      sx={{
        minHeight: '600px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '2rem 0',
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/img/home/home1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
        }}
      />
      
      {/* Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Search Filter Card */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            marginBottom: 4,
          }}
        >
          <CardContent sx={{ padding: 3 }}>
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                marginBottom: 3,
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              Find your next bike
            </Typography>
            
            {/* Top Row Filters */}
            <Grid container spacing={2} sx={{ marginBottom: 2 }}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Make</InputLabel>
                  <Select
                    value={make}
                    label="Make"
                    onChange={(e) => setMake(e.target.value)}
                  >
                    <MenuItem value="all">All makes</MenuItem>
                    <MenuItem value="honda">Honda</MenuItem>
                    <MenuItem value="yamaha">Yamaha</MenuItem>
                    <MenuItem value="kawasaki">Kawasaki</MenuItem>
                    <MenuItem value="suzuki">Suzuki</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Model</InputLabel>
                  <Select
                    value={model}
                    label="Model"
                    onChange={(e) => setModel(e.target.value)}
                    disabled={make === 'all'}
                  >
                    <MenuItem value="all">All models</MenuItem>
                    <MenuItem value="cbr">CBR</MenuItem>
                    <MenuItem value="cb">CB</MenuItem>
                    <MenuItem value="vfr">VFR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    label="Category"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <MenuItem value="all">All categories</MenuItem>
                    <MenuItem value="sport">Sport</MenuItem>
                    <MenuItem value="cruiser">Cruiser</MenuItem>
                    <MenuItem value="touring">Touring</MenuItem>
                    <MenuItem value="dirt">Dirt</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Keyword"
                  placeholder="Search by keyword..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{
                    height: '40px',
                    backgroundColor: '#d32f2f',
                    '&:hover': { backgroundColor: '#b71c1c' }
                  }}
                >
                  Show 21,842 bikes
                </Button>
              </Grid>
            </Grid>

            {/* Bottom Row Filters */}
            <Grid container spacing={2} sx={{ marginBottom: 2 }}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={location}
                    label="Location"
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    <MenuItem value="all">All locations</MenuItem>
                    <MenuItem value="seoul">Seoul</MenuItem>
                    <MenuItem value="busan">Busan</MenuItem>
                    <MenuItem value="daegu">Daegu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>New and used</InputLabel>
                  <Select
                    value={condition}
                    label="New and used"
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="used">Used</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Price min</InputLabel>
                  <Select
                    value={priceMin}
                    label="Price min"
                    onChange={(e) => setPriceMin(e.target.value)}
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="1000">$1,000</MenuItem>
                    <MenuItem value="5000">$5,000</MenuItem>
                    <MenuItem value="10000">$10,000</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Price max</InputLabel>
                  <Select
                    value={priceMax}
                    label="Price max"
                    onChange={(e) => setPriceMax(e.target.value)}
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="5000">$5,000</MenuItem>
                    <MenuItem value="10000">$10,000</MenuItem>
                    <MenuItem value="20000">$20,000</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="text"
                  color="error"
                  onClick={handleClearAll}
                  sx={{ textTransform: 'none' }}
                >
                  Clear all
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Bike Categories */}
        <Paper
          sx={{
            padding: 3,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Grid container spacing={2}>
            {bikeCategories.map((category) => (
              <Grid item xs={6} sm={4} md={3} lg={1.7} key={category.name}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: 1,
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={category.image}
                    alt={category.name}
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: 'contain',
                      marginBottom: 1,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      textAlign: 'center',
                      fontWeight: 500,
                      color: '#333',
                    }}
                  >
                    {category.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default HeroSection; 