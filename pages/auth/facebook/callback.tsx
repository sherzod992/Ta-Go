import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import { socialLogin, AuthProvider } from '../../../libs/auth';

const FacebookCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleFacebookCallback = async () => {
      const { code, error } = router.query;

      if (error) {
        console.error('Facebook OAuth error:', error);
        router.push('/login?error=facebook_auth_failed');
        return;
      }

      if (code) {
        try {
          // 백엔드로 authorization code를 전송하여 액세스 토큰 교환
          const response = await fetch('/api/auth/facebook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            throw new Error('Failed to exchange code for token');
          }

          const { accessToken, userInfo } = await response.json();
          
          // 소셜 로그인 처리
          await socialLogin(AuthProvider.FACEBOOK, accessToken);
          
          router.push('/');
        } catch (error) {
          console.error('Facebook callback error:', error);
          router.push('/login?error=facebook_auth_failed');
        }
      }
    };

    if (router.isReady) {
      handleFacebookCallback();
    }
  }, [router.isReady, router.query]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="h6" color="text.secondary">
        Facebook 로그인 처리 중...
      </Typography>
    </Box>
  );
};

export default FacebookCallback;
