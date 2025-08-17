import React from 'react';
import { Button, Typography } from '@mui/material';
import { MemberAuthType } from '../../auth';

interface SocialLoginButtonsProps {
  onSocialLogin: (authType: MemberAuthType, token: string, userInfo?: any) => void;
  loading: boolean;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ onSocialLogin, loading }) => {
  
  // Google 로그인
  const handleGoogleLogin = () => {
    // Google OAuth 2.0 구현
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&response_type=code&scope=openid%20email%20profile`;
    window.location.href = googleAuthUrl;
  };

  // Kakao 로그인
  const handleKakaoLogin = () => {
    // Kakao OAuth 구현
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/kakao/callback')}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  // Facebook 로그인
  const handleFacebookLogin = () => {
    // Facebook OAuth 구현
    const facebookAuthUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/facebook/callback')}&scope=email,public_profile`;
    window.location.href = facebookAuthUrl;
  };

  // GitHub 로그인
  const handleGitHubLogin = () => {
    // GitHub OAuth 구현
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/github/callback')}&scope=user:email`;
    window.location.href = githubAuthUrl;
  };

  // Telegram 로그인 (Telegram Login Widget 사용)
  const handleTelegramLogin = () => {
    // Telegram Login Widget 구현
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.Login) {
      window.Telegram.Login.auth(
        { bot_id: process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || '' },
        (data: any) => {
          if (data) {
            onSocialLogin(MemberAuthType.TELEGRAM, data.hash, data);
          }
        }
      );
    } else {
      // Telegram Login Widget이 로드되지 않은 경우
      console.error('Telegram Login Widget not loaded');
      // 임시로 다른 방식으로 처리
      onSocialLogin(MemberAuthType.TELEGRAM, 'mock_telegram_token', {});
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      gap: '16px'
    }}>
      {/* Telegram */}
      <Button
        onClick={handleTelegramLogin}
        disabled={loading}
        sx={{
          width: 48,
          height: 48,
          minWidth: 48,
          borderRadius: '50%',
          backgroundColor: '#0088CC',
          color: 'white',
          '&:hover': { backgroundColor: '#0077b3' }
        }}
      >
        <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>T</Typography>
      </Button>

      {/* Kakao */}
      <Button
        onClick={handleKakaoLogin}
        disabled={loading}
        sx={{
          width: 48,
          height: 48,
          minWidth: 48,
          borderRadius: '50%',
          backgroundColor: '#FEE500',
          color: '#000',
          '&:hover': { backgroundColor: '#fdd835' }
        }}
      >
        <Typography sx={{ fontSize: '20px' }}>💬</Typography>
      </Button>

      {/* Google */}
      <Button
        onClick={handleGoogleLogin}
        disabled={loading}
        sx={{
          width: 48,
          height: 48,
          minWidth: 48,
          borderRadius: '50%',
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          color: '#4285F4',
          '&:hover': { backgroundColor: '#f5f5f5' }
        }}
      >
        <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>G</Typography>
      </Button>

      {/* Facebook */}
      <Button
        onClick={handleFacebookLogin}
        disabled={loading}
        sx={{
          width: 48,
          height: 48,
          minWidth: 48,
          borderRadius: '50%',
          backgroundColor: '#1877F2',
          color: 'white',
          '&:hover': { backgroundColor: '#166fe5' }
        }}
      >
        <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>f</Typography>
      </Button>

      {/* GitHub */}
      <Button
        onClick={handleGitHubLogin}
        disabled={loading}
        sx={{
          width: 48,
          height: 48,
          minWidth: 48,
          borderRadius: '50%',
          backgroundColor: '#333',
          color: 'white',
          '&:hover': { backgroundColor: '#555' }
        }}
      >
        <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>G</Typography>
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
