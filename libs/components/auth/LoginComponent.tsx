import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import { useRouter } from 'next/router';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { 
  logIn, 
  signUp, 
  socialLogin, 
  MemberAuthType, 
  MemberType,
  getAuthTypeDisplayName,
  isSocialAuthType,
  isTraditionalAuthType 
} from '../../auth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const LoginComponent: React.FC = () => {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login state
  const [loginNick, setLoginNick] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupNick, setSignupNick] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupContact, setSignupContact] = useState('');
  const [signupAuthType, setSignupAuthType] = useState<MemberAuthType>(MemberAuthType.PHONE);
  const [signupMemberType, setSignupMemberType] = useState<MemberType>(MemberType.USER);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await logIn(loginNick, loginPassword);
      router.push('/');
    } catch (err) {
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (signupPassword !== signupConfirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    if (!signupContact.trim()) {
      setError('연락처를 입력해주세요.');
      setLoading(false);
      return;
    }

    // 전화번호 유효성 검사 (전화번호 인증 방식인 경우)
    if (signupAuthType === MemberAuthType.PHONE && !isValidPhoneNumber(signupContact)) {
      setError('올바른 전화번호를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      console.log('Signup attempt with:', {
        nick: signupNick,
        password: signupPassword,
        contact: signupContact,
        authType: signupAuthType,
        memberType: signupMemberType
      });
      
      await signUp(signupNick, signupPassword, signupContact, signupAuthType, signupMemberType);
      console.log('Signup successful');
      router.push('/');
    } catch (err) {
      console.error('Signup error in component:', err);
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (authType: MemberAuthType) => {
    setLoading(true);
    setError('');

    try {
      // 실제 소셜 로그인 구현에서는 각 플랫폼의 SDK를 사용해야 합니다
      // 여기서는 예시로 임시 토큰을 사용합니다
      const mockToken = `mock_${authType.toLowerCase()}_token`;
      await socialLogin(authType, mockToken);
      router.push('/');
    } catch (err) {
      setError(`${getAuthTypeDisplayName(authType)} 로그인에 실패했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  const getContactLabel = () => {
    switch (signupAuthType) {
      case MemberAuthType.PHONE:
        return '전화번호';
      case MemberAuthType.EMAIL:
        return '이메일';
      default:
        return '연락처';
    }
  };

  const getContactPlaceholder = () => {
    switch (signupAuthType) {
      case MemberAuthType.PHONE:
        return '010-1234-5678';
      case MemberAuthType.EMAIL:
        return 'example@email.com';
      default:
        return '연락처를 입력하세요';
    }
  };

  const getSocialButtonColor = (authType: MemberAuthType): string => {
    switch (authType) {
      case MemberAuthType.KAKAO:
        return '#FEE500';
      case MemberAuthType.GOOGLE:
        return '#4285F4';
      case MemberAuthType.FACEBOOK:
        return '#1877F2';
      case MemberAuthType.GITHUB:
        return '#333333';
      case MemberAuthType.TELEGRAM:
        return '#0088CC';
      default:
        return '#666666';
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            {tabValue === 0 ? '로그인' : '회원가입'}
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="로그인" />
              <Tab label="회원가입" />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="아이디"
                value={loginNick}
                onChange={(e) => setLoginNick(e.target.value)}
                margin="normal"
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="비밀번호"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : '로그인'}
              </Button>
            </Box>
          </TabPanel>

          {/* Signup Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box component="form" onSubmit={handleSignup}>
              <TextField
                fullWidth
                label="아이디"
                value={signupNick}
                onChange={(e) => setSignupNick(e.target.value)}
                margin="normal"
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="비밀번호"
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                helperText="최소 6자 이상"
              />
              <TextField
                fullWidth
                label="비밀번호 확인"
                type="password"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading}
              />
              <FormControl fullWidth margin="normal" disabled={loading}>
                <InputLabel>인증 방식</InputLabel>
                <Select
                  value={signupAuthType}
                  label="인증 방식"
                  onChange={(e) => setSignupAuthType(e.target.value as MemberAuthType)}
                >
                  {Object.values(MemberAuthType).map((authType) => (
                    <MenuItem key={authType} value={authType}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{getAuthTypeDisplayName(authType)}</span>
                        {isSocialAuthType(authType) && (
                          <Chip 
                            label="소셜" 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal" disabled={loading}>
                <InputLabel>사용자 타입</InputLabel>
                <Select
                  value={signupMemberType}
                  label="사용자 타입"
                  onChange={(e) => setSignupMemberType(e.target.value as MemberType)}
                >
                  <MenuItem value={MemberType.USER}>일반 사용자</MenuItem>
                  <MenuItem value={MemberType.AGENT}>에이전트</MenuItem>
                </Select>
              </FormControl>
              {signupAuthType === MemberAuthType.PHONE ? (
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    전화번호
                  </Typography>
                  <PhoneInput
                    international
                    defaultCountry="KR"
                    value={signupContact}
                    onChange={(value) => setSignupContact(value || '')}
                    placeholder="전화번호를 입력하세요"
                    disabled={loading}
                    className={loading ? 'Mui-disabled' : ''}
                  />
                </Box>
              ) : (
                <TextField
                  fullWidth
                  label={getContactLabel()}
                  value={signupContact}
                  onChange={(e) => setSignupContact(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                  placeholder={getContactPlaceholder()}
                />
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : '회원가입'}
              </Button>
            </Box>
          </TabPanel>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              또는
            </Typography>
          </Divider>

          {/* Social Login Buttons */}
          <Typography variant="h6" align="center" gutterBottom>
            소셜 로그인
          </Typography>
          <Grid container spacing={2}>
            {Object.values(MemberAuthType)
              .filter(isSocialAuthType)
              .map((authType) => (
                <Grid item xs={6} key={authType}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleSocialLogin(authType)}
                    disabled={loading}
                    sx={{ 
                      borderColor: getSocialButtonColor(authType), 
                      color: getSocialButtonColor(authType),
                      '&:hover': { 
                        borderColor: getSocialButtonColor(authType), 
                        backgroundColor: `${getSocialButtonColor(authType)}10` 
                      }
                    }}
                  >
                    {getAuthTypeDisplayName(authType)}
                  </Button>
                </Grid>
              ))}
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginComponent; 