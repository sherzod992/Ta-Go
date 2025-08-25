import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { logIn } from '../../auth';
import { sweetMixinErrorAlert } from '../../sweetAlert';

const LoginComponent: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [formData, setFormData] = useState({
    nick: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 에러 메시지 클리어
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nick || !formData.password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (!privacyAgreed) {
      setError('개인정보 처리방침에 동의해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await logIn(formData.nick, formData.password);
      // 로그인 성공 시 홈페이지로 이동
      router.push('/');
    } catch (err) {
      console.error('로그인 실패:', err);
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4
      }}>
        <Paper elevation={3} sx={{ 
          p: 4, 
          width: '100%',
          maxWidth: 400,
          borderRadius: 2
        }}>
          {/* 헤더 */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#667eea' }}>
              ta-Go
            </Typography>
            <Typography variant="h6" gutterBottom>
              {t('Login')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('Welcome back! Please sign in to your account.')}
            </Typography>
          </Box>

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* 로그인 폼 */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label={t('Username')}
              name="nick"
              value={formData.nick}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              required
              disabled={loading}
              autoComplete="username"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label={t('Password')}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              required
              disabled={loading}
              autoComplete="current-password"
              sx={{ mb: 3 }}
            />

            {/* 개인정보 동의 체크박스 */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  disabled={loading}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  개인정보 처리방침에 동의합니다
                </Typography>
              }
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                backgroundColor: '#667eea',
                '&:hover': {
                  backgroundColor: '#5a6fd8'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('Sign In')
              )}
            </Button>
          </Box>

          {/* 회원가입 링크 */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              계정이 없으신가요?{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => router.push('/signup')}
                sx={{ 
                  color: '#667eea',
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto'
                }}
              >
                회원가입
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginComponent;
