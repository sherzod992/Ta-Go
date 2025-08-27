import React, { useState, useEffect } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface ProgressBarProps {
  isLoading: boolean;
  message?: string;
  variant?: 'determinate' | 'indeterminate';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  isLoading,
  message,
  variant = 'indeterminate',
  color = 'primary',
  showPercentage = false,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading && variant === 'determinate') {
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 90) {
            return 90; // 90%에서 멈춤 (실제 완료 시 100%로 설정)
          }
          return prevProgress + 10;
        });
      }, 200);

      return () => {
        clearInterval(timer);
      };
    } else if (!isLoading) {
      setProgress(100);
      // 완료 후 잠시 후 숨김
      const timer = setTimeout(() => {
        setProgress(0);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, variant]);

  if (!isLoading && progress === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <LinearProgress
        variant={variant}
        value={variant === 'determinate' ? progress : undefined}
        color={color}
        sx={{
          height: 3,
          '& .MuiLinearProgress-bar': {
            transition: 'transform 0.2s ease',
          },
        }}
      />
      {(message || showPercentage) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {message && (
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          )}
          {showPercentage && variant === 'determinate' && (
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}%
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

// 페이지 전환용 Progress Bar
export const PageTransitionProgress: React.FC<{ isLoading: boolean }> = ({ isLoading }) => (
  <ProgressBar
    isLoading={isLoading}
    message="페이지를 불러오는 중..."
    variant="indeterminate"
    color="primary"
  />
);

// 데이터 로딩용 Progress Bar
export const DataLoadingProgress: React.FC<{ 
  isLoading: boolean; 
  message?: string;
  progress?: number;
}> = ({ isLoading, message = '데이터를 불러오는 중...', progress }) => (
  <ProgressBar
    isLoading={isLoading}
    message={message}
    variant={progress !== undefined ? 'determinate' : 'indeterminate'}
    color="secondary"
    showPercentage={progress !== undefined}
  />
);

export default ProgressBar;
