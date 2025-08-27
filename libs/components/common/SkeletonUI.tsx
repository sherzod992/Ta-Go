import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';

interface SkeletonUIProps {
  type: 'card' | 'list' | 'detail' | 'grid' | 'custom';
  count?: number;
  height?: number;
  width?: number;
  variant?: 'text' | 'rectangular' | 'circular';
}

const SkeletonUI: React.FC<SkeletonUIProps> = ({
  type,
  count = 1,
  height,
  width,
  variant = 'rectangular',
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Grid container spacing={2}>
            {Array.from({ length: count }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: height || 300 }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={16} width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 'list':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Array.from({ length: count }).map((_, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" height={20} width="70%" sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" height={16} width="50%" />
                </Box>
              </Box>
            ))}
          </Box>
        );

      case 'detail':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Skeleton variant="text" height={32} width="80%" />
              <Skeleton variant="text" height={24} width="60%" />
              <Skeleton variant="text" height={20} width="90%" />
              <Skeleton variant="text" height={20} width="85%" />
              <Skeleton variant="text" height={20} width="70%" />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} variant="rectangular" width={80} height={32} sx={{ borderRadius: 16 }} />
              ))}
            </Box>
          </Box>
        );

      case 'grid':
        return (
          <Grid container spacing={2}>
            {Array.from({ length: count }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Skeleton
                  variant={variant}
                  height={height || 200}
                  width={width || '100%'}
                  sx={{ borderRadius: 1 }}
                />
              </Grid>
            ))}
          </Grid>
        );

      case 'custom':
        return (
          <Skeleton
            variant={variant}
            height={height || 100}
            width={width || '100%'}
            sx={{ borderRadius: 1 }}
          />
        );

      default:
        return null;
    }
  };

  return renderSkeleton();
};

// 특정 용도의 Skeleton 컴포넌트들
export const PropertyCardSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <Card sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
          <Skeleton variant="rectangular" height={200} />
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
            <Skeleton variant="text" height={16} width="40%" sx={{ mb: 2 }} />
            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton variant="text" height={20} width="30%" />
              <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 16 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export const AgentCardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <Card sx={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ mb: 2 }} />
          <Skeleton variant="text" height={24} width="80%" sx={{ mb: 1 }} />
          <Skeleton variant="text" height={16} width="60%" sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" width={60} height={24} sx={{ borderRadius: 12 }} />
            ))}
          </Box>
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 2 }} />
        </Card>
      </Grid>
    ))}
  </Grid>
);

export const ChatMessageSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {Array.from({ length: count }).map((_, index) => (
      <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 0.5 }} />
          <Skeleton variant="text" height={12} width="20%" />
        </Box>
      </Box>
    ))}
  </Box>
);

export default SkeletonUI;
