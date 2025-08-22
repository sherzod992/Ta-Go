import React from 'react';
import { Box, Typography } from '@mui/material';

const LoginComponent: React.FC = () => {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        로그인
      </Typography>
      <Typography variant="body1" color="text.secondary">
        로그인 기능이 구현 중입니다.
      </Typography>
    </Box>
  );
};

export default LoginComponent;
