import React from 'react';
import { Typography, TypographyProps } from '@mui/material';
import { styled } from '@mui/material/styles';

// 유동적 타이포그래피 스타일
const FluidTypography = styled(Typography)(({ theme }) => ({
  transition: 'all 0.3s ease-in-out',
  
  '&.MuiTypography-h1': {
    fontSize: 'clamp(2rem, 8vw, 4rem)',
    lineHeight: 1.1,
    fontWeight: 700,
  },
  
  '&.MuiTypography-h2': {
    fontSize: 'clamp(1.5rem, 6vw, 3rem)',
    lineHeight: 1.2,
    fontWeight: 600,
  },
  
  '&.MuiTypography-h3': {
    fontSize: 'clamp(1.25rem, 5vw, 2.5rem)',
    lineHeight: 1.3,
    fontWeight: 600,
  },
  
  '&.MuiTypography-h4': {
    fontSize: 'clamp(1.125rem, 4vw, 2rem)',
    lineHeight: 1.4,
    fontWeight: 500,
  },
  
  '&.MuiTypography-h5': {
    fontSize: 'clamp(1rem, 3.5vw, 1.75rem)',
    lineHeight: 1.4,
    fontWeight: 500,
  },
  
  '&.MuiTypography-h6': {
    fontSize: 'clamp(0.875rem, 3vw, 1.5rem)',
    lineHeight: 1.4,
    fontWeight: 500,
  },
  
  '&.MuiTypography-subtitle1': {
    fontSize: 'clamp(0.875rem, 2.5vw, 1.25rem)',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  
  '&.MuiTypography-subtitle2': {
    fontSize: 'clamp(0.75rem, 2vw, 1rem)',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  
  '&.MuiTypography-body1': {
    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  
  '&.MuiTypography-body2': {
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  
  '&.MuiTypography-caption': {
    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  
  '&.MuiTypography-overline': {
    fontSize: 'clamp(0.5rem, 1.2vw, 0.625rem)',
    lineHeight: 1.5,
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
}));

interface FluidTypographyProps extends TypographyProps {
  children: React.ReactNode;
  gradient?: boolean;
  glow?: boolean;
}

const FluidTypographyComponent: React.FC<FluidTypographyProps> = ({ 
  children, 
  gradient = false, 
  glow = false,
  ...props 
}) => {
  const gradientStyles = gradient ? {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } : {};

  const glowStyles = glow ? {
    textShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
  } : {};

  return (
    <FluidTypography
      {...props}
      sx={{
        ...gradientStyles,
        ...glowStyles,
        ...props.sx,
      }}
    >
      {children}
    </FluidTypography>
  );
};

export default FluidTypographyComponent;
