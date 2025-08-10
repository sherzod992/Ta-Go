import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation('common');
  const [make, setMake] = useState('all');
  const [model, setModel] = useState('all');
  const [category, setCategory] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('all');
  const [condition, setCondition] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const bikeCategories = [
    { name: 'Adventure Tourers', image: '/img/typeImages/ADVENTUREmoto.webp' },
    { name: 'Agriculture', image: '/img/typeImages/AGRICULTUREmoto.png' },
    { name: 'All Terrain Vehicles', image: '/img/typeImages/ALL_TERRAIN.jpg' },
    { name: 'Dirt Bikes', image: '/img/typeImages/dirtbike.avif' },
    { name: 'Electric', image: '/img/typeImages/electric.avif' },
    { name: 'Enduro', image: '/img/typeImages/dirt-bikes.png' },
    { name: 'Mini Bikes', image: '/img/typeImages/minibikes.jpg' },
    { name: 'SxS/UTV', image: '/img/typeImages/UTVbikes.avif' }
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
        minHeight: '800px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Image - Full Size */}
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
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
          }
        }}
      />
      
      {/* Hero Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            textAlign: 'center',
            color: 'white',
            pt: 8,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '3rem', md: '5rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              marginBottom: 2,
            }}
          >
            {t('Find your next bike')}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              marginBottom: 4,
            }}
          >
            {t('Discover the perfect ride for your adventure')}
          </Typography>
        </Box>
      </Container>

      {/* Search Filter Card - Positioned at Bottom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          pb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              marginBottom: 2,
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
                {t('Search Filters')}
              </Typography>
              
              {/* Top Row Filters */}
              <Grid container spacing={2} sx={{ marginBottom: 2 }}>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('Make')}</InputLabel>
                    <Select
                      value={make}
                      label={t('Make')}
                      onChange={(e) => setMake(e.target.value)}
                    >
                      <MenuItem value="all">{t('All makes')}</MenuItem>
                      <MenuItem value="honda">Honda</MenuItem>
                      <MenuItem value="yamaha">Yamaha</MenuItem>
                      <MenuItem value="kawasaki">Kawasaki</MenuItem>
                      <MenuItem value="suzuki">Suzuki</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('Model')}</InputLabel>
                    <Select
                      value={model}
                      label={t('Model')}
                      onChange={(e) => setModel(e.target.value)}
                      disabled={make === 'all'}
                    >
                      <MenuItem value="all">{t('All models')}</MenuItem>
                      <MenuItem value="cbr">CBR</MenuItem>
                      <MenuItem value="cb">CB</MenuItem>
                      <MenuItem value="vfr">VFR</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('Category')}</InputLabel>
                    <Select
                      value={category}
                      label={t('Category')}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <MenuItem value="all">{t('All categories')}</MenuItem>
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
                    label={t('Keyword')}
                    placeholder={t('Search by keyword')}
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
                    {t('Show bikes')}
                  </Button>
                </Grid>
              </Grid>

              {/* Bottom Row Filters */}
              <Grid container spacing={2} sx={{ marginBottom: 2 }}>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('Location')}</InputLabel>
                    <Select
                      value={location}
                      label={t('Location')}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <MenuItem value="all">{t('All locations')}</MenuItem>
                      <MenuItem value="seoul">Seoul</MenuItem>
                      <MenuItem value="busan">Busan</MenuItem>
                      <MenuItem value="daegu">Daegu</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('New and used')}</InputLabel>
                    <Select
                      value={condition}
                      label={t('New and used')}
                      onChange={(e) => setCondition(e.target.value)}
                    >
                      <MenuItem value="all">{t('Any')}</MenuItem>
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="used">Used</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('Price min')}</InputLabel>
                    <Select
                      value={priceMin}
                      label={t('Price min')}
                      onChange={(e) => setPriceMin(e.target.value)}
                    >
                      <MenuItem value="">{t('Any')}</MenuItem>
                      <MenuItem value="1000">$1,000</MenuItem>
                      <MenuItem value="5000">$5,000</MenuItem>
                      <MenuItem value="10000">$10,000</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('Price max')}</InputLabel>
                    <Select
                      value={priceMax}
                      label={t('Price max')}
                      onChange={(e) => setPriceMax(e.target.value)}
                    >
                      <MenuItem value="">{t('Any')}</MenuItem>
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
                    {t('Clear all')}
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
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
    </Box>
  );
};

export default HeroSection; 