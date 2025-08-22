import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import { socialLogin, AuthProvider } from '../../../libs/auth';

const GitHubCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleGitHubCallback = async () => {
      const { code, error } = router.query;

      if (error) {
        console.error('GitHub OAuth error:', error);
        router.push('/login?error=github_auth_failed');
        return;
      }

      if (code) {
        try {
          // 백엔드로 authorization code를 전송하여 액세스 토큰 교환
          const response = await fetch('/api/auth/github', {
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
          await socialLogin(AuthProvider.GITHUB, accessToken);
          
          router.push('/');
        } catch (error) {
          console.error('GitHub callback error:', error);
          router.push('/login?error=github_auth_failed');
        }
      }
    };

    if (router.isReady) {
      handleGitHubCallback();
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
        GitHub 로그인 처리 중...
      </Typography>
    </Box>
  );
};

export default GitHubCallback;
