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
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { 
  logIn, 
  signUp, 
  socialLogin, 
  AuthProvider, 
  MemberType,
  getAuthTypeDisplayName,
  isSocialAuthType,
  isTraditionalAuthType 
} from '../../auth';
import { safeRedirect } from '../../utils/security';

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

  // 이메일 유효성 검사 함수
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Login state
  const [loginNick, setLoginNick] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupNick, setSignupNick] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupContact, setSignupContact] = useState('');
  const [signupAuthType, setSignupAuthType] = useState<AuthProvider>(AuthProvider.EMAIL);
  const [signupMemberType, setSignupMemberType] = useState<MemberType>(MemberType.USER);
  const [privacyAgreement, setPrivacyAgreement] = useState(false);
  const [marketingAgreement, setMarketingAgreement] = useState(false);

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
      safeRedirect('/');
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
    if (signupAuthType === AuthProvider.PHONE && !isValidPhoneNumber(signupContact)) {
      setError('올바른 전화번호를 입력해주세요.');
      setLoading(false);
      return;
    }

    // 이메일 유효성 검사 (이메일 인증 방식인 경우)
    if (signupAuthType === AuthProvider.EMAIL && !isValidEmail(signupContact)) {
      setError('올바른 이메일을 입력해주세요.');
      setLoading(false);
      return;
    }

    // 개인정보 수집 및 이용 동의 필수 체크 확인
    if (!privacyAgreement) {
      setError('개인정보 수집 및 이용에 동의해주세요.');
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

  const handleSocialLogin = async (authType: AuthProvider) => {
    setLoading(true);
    setError('');

    try {
      // 실제 소셜 로그인 구현에서는 각 플랫폼의 SDK를 사용해야 합니다
      // 여기서는 예시로 임시 토큰을 사용합니다
      const mockToken = `mock_${authType.toLowerCase()}_token`;
      await socialLogin(authType, mockToken);
      router.push('/');
    } catch (err) {
      // 소셜 로그인 실패 시 사용자 친화적인 메시지 표시
      const result = await Swal.fire({
        title: '소셜 로그인 준비중입니다',
        text: '전화번호로 회원가입하시면 됩니다.',
        icon: 'info',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2',
        showCancelButton: false,
        allowOutsideClick: false
      });

      // OK 버튼 클릭 시 회원가입 탭으로 이동
      if (result && (result as any).isConfirmed) {
        setTabValue(1); // 회원가입 탭으로 이동
        setSignupAuthType(AuthProvider.PHONE); // 전화번호 인증 방식으로 설정
        setSignupContact(''); // 연락처 필드 초기화
        setError(''); // 에러 메시지 초기화
        
        // 아이디 입력 필드로 포커스 이동
        setTimeout(() => {
          const idInput = document.querySelector('input[placeholder="아이디"], input[aria-label="아이디"], input[name="signupNick"]') as HTMLInputElement;
          if (idInput) {
            idInput.focus();
            idInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } finally {
      setLoading(false);
    }
  };

  const getContactLabel = () => {
    switch (signupAuthType) {
      case AuthProvider.PHONE:
        return '전화번호';
      case AuthProvider.EMAIL:
        return '이메일';
      default:
        return '연락처';
    }
  };

  const getContactPlaceholder = () => {
    switch (signupAuthType) {
      case AuthProvider.PHONE:
        return '010-1234-5678';
      case AuthProvider.EMAIL:
        return 'example@email.com';
      default:
        return '연락처를 입력하세요';
    }
  };

  const getSocialButtonColor = (authType: AuthProvider): string => {
    switch (authType) {
      case AuthProvider.KAKAO:
        return '#FEE500';
      case AuthProvider.GOOGLE:
        return '#4285F4';
      case AuthProvider.FACEBOOK:
        return '#1877F2';
      case AuthProvider.GITHUB:
        return '#333333';
      default:
        return '#666666';
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            {tabValue === 0 ? '로그인' : '회원가입'}
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
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
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="아이디"
                    name="signupNick"
                    value={signupNick}
                    onChange={(e) => setSignupNick(e.target.value)}
                    margin="normal"
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                </Grid>
                <Grid item xs={12} sm={6}>
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
                </Grid>
                              <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" disabled={loading}>
                    <InputLabel>인증 방식</InputLabel>
                                    <Select
                  value={signupAuthType}
                  label="인증 방식"
                  onChange={(e) => setSignupAuthType(e.target.value as AuthProvider)}
                >
                  <MenuItem value={AuthProvider.EMAIL}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>이메일</span>
                    </Box>
                  </MenuItem>
                  <MenuItem value={AuthProvider.PHONE}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>전화번호</span>
                    </Box>
                  </MenuItem>
                </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
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
                </Grid>
                <Grid item xs={12}>
                  {signupAuthType === AuthProvider.PHONE ? (
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
                      type={signupAuthType === AuthProvider.EMAIL ? 'email' : 'text'}
                    />
                  )}
                </Grid>
              </Grid>

              {/* 개인정보 수집 및 이용 동의 */}
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                  개인정보 수집 및 이용 동의
                </Typography>
                
                {/* 필수 동의 */}
                <Box 
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1,
                    '&:hover': {
                      border: '1px solid #d32f2f',
                      backgroundColor: '#fff5f5'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <input
                      type="checkbox"
                      id="privacy-agreement"
                      checked={privacyAgreement}
                      onChange={(e) => setPrivacyAgreement(e.target.checked)}
                      style={{
                        marginTop: '2px',
                        cursor: 'pointer',
                        transform: 'scale(1.2)'
                      }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                        개인정보 수집 및 이용에 동의합니다 (필수)
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        회원가입을 위해 개인정보 수집 및 이용에 동의가 필요합니다.
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* 선택 동의 */}
                <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#fafafa' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <input
                      type="checkbox"
                      id="marketing-agreement"
                      checked={marketingAgreement}
                      onChange={(e) => setMarketingAgreement(e.target.checked)}
                      style={{
                        marginTop: '2px',
                        cursor: 'pointer',
                        transform: 'scale(1.2)'
                      }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#666' }}>
                        마케팅 정보 수신에 동의합니다 (선택)
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        새로운 서비스 및 이벤트 정보를 이메일로 받아보실 수 있습니다.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  opacity: privacyAgreement ? 1 : 0.6,
                  cursor: privacyAgreement ? 'pointer' : 'not-allowed'
                }}
                disabled={loading || !privacyAgreement}
              >
                {loading ? <CircularProgress size={24} /> : '회원가입'}
              </Button>
            </Box>
          </TabPanel>


        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginComponent; 