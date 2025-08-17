import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  price?: string;
  tags?: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'featured';
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  title,
  subtitle,
  description,
  image,
  price,
  tags = [],
  isLiked = false,
  isBookmarked = false,
  onLike,
  onShare,
  onBookmark,
  onClick,
  variant = 'default',
}) => {
  const theme = useTheme();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // Material-UI의 useMediaQuery도 함께 사용
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // 반응형 스타일 계산
  const getCardStyles = () => {
    const baseStyles = {
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
      },
    };

    switch (variant) {
      case 'compact':
        return {
          ...baseStyles,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        };
      case 'featured':
        return {
          ...baseStyles,
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: theme.shadows[12],
          },
        };
      default:
        return baseStyles;
    }
  };

  const getImageHeight = () => {
    if (variant === 'compact') {
      return isMobile ? 120 : isTablet ? 140 : 160;
    }
    if (variant === 'featured') {
      return isMobile ? 200 : isTablet ? 240 : 280;
    }
    return isMobile ? 160 : isTablet ? 180 : 200;
  };

  const getTitleVariant = () => {
    if (variant === 'compact') {
      return isMobile ? 'h6' : 'h5';
    }
    if (variant === 'featured') {
      return isMobile ? 'h5' : 'h4';
    }
    return isMobile ? 'h6' : 'h5';
  };

  const getDescriptionLines = () => {
    if (variant === 'compact') return 2;
    if (variant === 'featured') return 4;
    return 3;
  };

  return (
    <Card
      sx={getCardStyles()}
      onClick={onClick}
      elevation={variant === 'featured' ? 4 : 2}
    >
      {image && (
        <CardMedia
          component="img"
          image={image}
          alt={title}
          sx={{
            height: getImageHeight(),
            objectFit: 'cover',
            position: 'relative',
          }}
        />
      )}

      {/* 액션 버튼들 - 이미지 위에 오버레이 */}
      {(onLike || onShare || onBookmark) && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 0.5,
            opacity: 0,
            transition: 'opacity 0.3s ease',
            '.MuiCard-root:hover &': {
              opacity: 1,
            },
          }}
        >
          {onLike && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
              }}
            >
              {isLiked ? (
                <FavoriteIcon color="error" fontSize="small" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </IconButton>
          )}

          {onShare && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
              }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          )}

          {onBookmark && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
              }}
            >
              <BookmarkIcon 
                color={isBookmarked ? 'primary' : 'inherit'} 
                fontSize="small" 
              />
            </IconButton>
          )}
        </Box>
      )}

      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 1.5, sm: 2 },
        }}
      >
        {/* 제목과 부제목 */}
        <Box sx={{ mb: 1 }}>
          <Typography
            variant={getTitleVariant()}
            component="h3"
            sx={{
              fontWeight: 'bold',
              lineHeight: 1.2,
              mb: subtitle ? 0.5 : 1,
              fontSize: {
                xs: variant === 'featured' ? '1.1rem' : '1rem',
                sm: variant === 'featured' ? '1.25rem' : '1.1rem',
                md: variant === 'featured' ? '1.5rem' : '1.25rem',
              },
            }}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                mb: 1,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* 태그들 */}
        {tags.length > 0 && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              mb: 1,
              flexWrap: 'wrap',
              gap: 0.5,
            }}
          >
            {tags.slice(0, isMobile ? 2 : isTablet ? 3 : 4).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: { xs: '0.6rem', sm: '0.75rem' },
                  height: { xs: 20, sm: 24 },
                }}
              />
            ))}
            {tags.length > (isMobile ? 2 : isTablet ? 3 : 4) && (
              <Chip
                label={`+${tags.length - (isMobile ? 2 : isTablet ? 3 : 4)}`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: { xs: '0.6rem', sm: '0.75rem' },
                  height: { xs: 20, sm: 24 },
                }}
              />
            )}
          </Stack>
        )}

        {/* 설명 */}
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: getDescriptionLines(),
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              lineHeight: 1.4,
              mb: 1,
            }}
          >
            {description}
          </Typography>
        )}

        {/* 가격과 액션 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto',
          }}
        >
          {price && (
            <Typography
              variant="h6"
              color="primary"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              }}
            >
              {price}
            </Typography>
          )}

          {/* 추가 액션 버튼들 - 하단에 배치 */}
          {isMobile && (onLike || onShare || onBookmark) && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {onLike && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike();
                  }}
                >
                  {isLiked ? (
                    <FavoriteIcon color="error" fontSize="small" />
                  ) : (
                    <FavoriteBorderIcon fontSize="small" />
                  )}
                </IconButton>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ResponsiveCard;
