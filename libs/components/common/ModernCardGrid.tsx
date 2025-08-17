import React from 'react';
import { Box, Card, CardContent, CardMedia, Typography, Chip, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

// 현대적인 카드 스타일
const ModernCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
  },
  
  '& .MuiCardMedia-root': {
    height: '200px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  
  '& .MuiCardContent-root': {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
  },
  
  '& .card-title': {
    fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
    fontWeight: 600,
    marginBottom: '12px',
    lineHeight: 1.3,
  },
  
  '& .card-description': {
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    color: '#666',
    marginBottom: '16px',
    flex: 1,
    lineHeight: 1.5,
  },
  
  '& .card-footer': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  
  '& .price': {
    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
    fontWeight: 700,
    color: '#1976d2',
  },
  
  '& .status-chip': {
    fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
    fontWeight: 500,
  }
}));

interface CardItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  status: 'available' | 'sold' | 'pending';
  tags?: string[];
}

interface ModernCardGridProps {
  items: CardItem[];
  title?: string;
  subtitle?: string;
}

const ModernCardGrid: React.FC<ModernCardGridProps> = ({ items, title, subtitle }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'sold': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'sold': return 'Sold';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  return (
    <Box className="responsive-container">
      {(title || subtitle) && (
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 4, md: 6 },
          px: { xs: 2, md: 0 }
        }}>
          {title && (
            <Typography 
              variant="h2" 
              className="fluid-heading"
              sx={{ 
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography 
              variant="h5" 
              className="fluid-text"
              sx={{ 
                color: '#666',
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      
      <Box className="card-grid">
        {items.map((item) => (
          <ModernCard key={item.id}>
            <CardMedia
              component="img"
              image={item.image}
              alt={item.title}
            />
            <CardContent>
              <Typography className="card-title">
                {item.title}
              </Typography>
              
              <Typography className="card-description">
                {item.description}
              </Typography>
              
              {item.tags && item.tags.length > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  mb: 2,
                  flexWrap: 'wrap'
                }}>
                  {item.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{
                        fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                        height: '24px'
                      }}
                    />
                  ))}
                </Box>
              )}
              
              <Box className="card-footer">
                <Typography className="price">
                  {item.price}
                </Typography>
                <Chip
                  label={getStatusText(item.status)}
                  color={getStatusColor(item.status) as any}
                  className="status-chip"
                  size="small"
                />
              </Box>
            </CardContent>
          </ModernCard>
        ))}
      </Box>
    </Box>
  );
};

export default ModernCardGrid;
