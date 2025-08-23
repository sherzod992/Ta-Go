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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText
} from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { signUp, AuthProvider, MemberType } from '../../auth';
import { sweetMixinErrorAlert } from '../../sweetAlert';

const SignupComponent: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [formData, setFormData] = useState({
    nick: '',
    password: '',
    confirmPassword: '',
    email: ''
  });
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [authType, setAuthType] = useState<AuthProvider>(AuthProvider.EMAIL);
  const [memberType, setMemberType] = useState<MemberType>(MemberType.USER);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 에러 메시지 클리어
    if (error) setError('');
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (value: string | undefined) => {
    setPhoneNumber(value || '');
    if (validationErrors.phoneNumber) {
      setValidationErrors(prev => ({ ...prev, phoneNumber: '' }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // 아이디 검증
    if (!formData.nick.trim()) {
      errors.nick = '아이디를 입력해주세요.';
    } else if (formData.nick.length < 3) {
      errors.nick = '아이디는 최소 3자 이상이어야 합니다.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    // 이메일 검증
    if (authType === AuthProvider.EMAIL) {
      if (!formData.email.trim()) {
        errors.email = '이메일을 입력해주세요.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = '올바른 이메일 형식을 입력해주세요.';
      }
    }

    // 전화번호 검증
    if (authType === AuthProvider.PHONE) {
      if (!phoneNumber) {
        errors.phoneNumber = '전화번호를 입력해주세요.';
      } else if (phoneNumber.length < 10) {
        errors.phoneNumber = '올바른 전화번호를 입력해주세요.';
      }
    }

    // 개인정보 동의 검증
    if (!privacyAgreed) {
      errors.privacy = '개인정보 처리방침에 동의해야 합니다.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('입력 정보를 확인해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const contactInfo = authType === AuthProvider.EMAIL ? formData.email : phoneNumber;
      await signUp(formData.nick, formData.password, contactInfo, authType, memberType);
      
      // 회원가입 성공 시 홈페이지로 이동
      await sweetMixinErrorAlert('회원가입이 완료되었습니다!');
      router.push('/');
    } catch (err) {
      console.error('회원가입 실패:', err);
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const hasRequiredFields = formData.nick.trim() && 
                             formData.password && 
                             formData.confirmPassword &&
                             formData.password === formData.confirmPassword &&
                             formData.password.length >= 6;
    
    const hasContactInfo = authType === AuthProvider.EMAIL ? 
                          formData.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) :
                          phoneNumber && phoneNumber.length >= 8; // 국제 전화번호는 최소 8자 이상
    
    const isValid = hasRequiredFields && hasContactInfo && privacyAgreed;
    
    // 디버깅용 로그 (개발 중에만 사용)
    if (process.env.NODE_ENV === 'development') {
      console.log('Form validation:', {
        hasRequiredFields,
        hasContactInfo,
        privacyAgreed,
        isValid,
        formData: {
          nick: formData.nick.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          email: formData.email.trim(),
          phoneNumber
        },
        authType,
        memberType
      });
    }
    
    return isValid;
  };

  const handlePrivacyModalOpen = () => {
    setShowPrivacyModal(true);
  };

  const handlePrivacyModalClose = () => {
    setShowPrivacyModal(false);
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
          maxWidth: 500,
          borderRadius: 2
        }}>
          {/* 헤더 */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#667eea' }}>
              ta-Go
            </Typography>
            <Typography variant="h6" gutterBottom>
              회원가입
            </Typography>
            <Typography variant="body2" color="text.secondary">
              새로운 계정을 만들어보세요
            </Typography>
          </Box>

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* 회원가입 폼 */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="아이디"
              name="nick"
              value={formData.nick}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              required
              disabled={loading}
              error={!!validationErrors.nick}
              helperText={validationErrors.nick}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="비밀번호"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              required
              disabled={loading}
              error={!!validationErrors.password}
              helperText={validationErrors.password || "최소 6자 이상"}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="비밀번호 확인"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              required
              disabled={loading}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              sx={{ mb: 2 }}
            />

            {/* 회원 유형 선택 */}
            <FormControl component="fieldset" fullWidth margin="normal" sx={{ mb: 2 }}>
              <FormLabel component="legend">회원 유형</FormLabel>
              <RadioGroup
                row
                value={memberType}
                onChange={(e) => setMemberType(e.target.value as MemberType)}
              >
                <FormControlLabel
                  value={MemberType.USER}
                  control={<Radio />}
                  label="일반 사용자"
                />
                <FormControlLabel
                  value={MemberType.AGENT}
                  control={<Radio />}
                  label="에이전트"
                />
              </RadioGroup>
            </FormControl>

            {/* 인증 방식 선택 */}
            <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
              <InputLabel>인증 방식</InputLabel>
              <Select
                value={authType}
                label="인증 방식"
                onChange={(e) => setAuthType(e.target.value as AuthProvider)}
                disabled={loading}
              >
                <MenuItem value={AuthProvider.EMAIL}>이메일</MenuItem>
                <MenuItem value={AuthProvider.PHONE}>전화번호</MenuItem>
              </Select>
            </FormControl>

            {/* 이메일 또는 전화번호 입력 */}
            {authType === AuthProvider.EMAIL ? (
              <TextField
                fullWidth
                label="이메일"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                required
                disabled={loading}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                sx={{ mb: 2 }}
              />
            ) : (
              <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  전화번호 *
                </Typography>
                <Box
                  sx={{
                    border: validationErrors.phoneNumber ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.23)',
                    borderRadius: '4px',
                    '&:hover': {
                      borderColor: validationErrors.phoneNumber ? '#d32f2f' : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&:focus-within': {
                      borderColor: '#1976d2',
                      borderWidth: '2px',
                    },
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <PhoneInput
                    international
                    defaultCountry="KR"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    style={{
                      padding: '16.5px 14px',
                      border: 'none',
                      outline: 'none',
                      fontSize: '16px',
                      width: '100%',
                      backgroundColor: 'transparent',
                    }}
                  />
                </Box>
                {validationErrors.phoneNumber && (
                  <FormHelperText error sx={{ mt: 0.5 }}>
                    {validationErrors.phoneNumber}
                  </FormHelperText>
                )}
              </FormControl>
            )}

            {/* 개인정보 동의 체크박스 */}
            <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={privacyAgreed}
                    onChange={(e) => {
                      setPrivacyAgreed(e.target.checked);
                      if (validationErrors.privacy) {
                        setValidationErrors(prev => ({ ...prev, privacy: '' }));
                      }
                    }}
                    disabled={loading}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      개인정보 처리방침에 동의합니다.
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={handlePrivacyModalOpen}
                      sx={{ 
                        color: '#667eea',
                        textTransform: 'none',
                        p: 0,
                        minWidth: 'auto',
                        fontSize: 'inherit'
                      }}
                    >
                      (보기)
                    </Button>
                  </Box>
                }
              />
              {validationErrors.privacy && (
                <FormHelperText error sx={{ mt: 0.5 }}>
                  {validationErrors.privacy}
                </FormHelperText>
              )}
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !isFormValid()}
              sx={{
                py: 1.5,
                backgroundColor: isFormValid() ? '#667eea' : '#ccc',
                '&:hover': {
                  backgroundColor: isFormValid() ? '#5a6fd8' : '#ccc'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                '회원가입'
              )}
            </Button>
          </Box>

          {/* 로그인 링크 */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              이미 계정이 있으신가요?{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => router.push('/login')}
                sx={{ 
                  color: '#667eea',
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto'
                }}
              >
                로그인
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* 개인정보 처리방침 모달 */}
      <Dialog
        open={showPrivacyModal}
        onClose={handlePrivacyModalClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          개인정보 처리방침
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            {`제1조 (개인정보의 처리 목적)
ta-Go는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.

1. 회원가입 및 관리
회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 만14세 미만 아동 개인정보 수집 시 법정 대리인 동의여부 확인, 각종 고지·통지, 고충처리 목적으로 개인정보를 처리합니다.

2. 재화 또는 서비스 제공
물품배송, 서비스 제공, 계약서·청구서 발송, 콘텐츠 제공, 맞춤서비스 제공, 본인인증, 연령인증, 요금결제·정산, 채권추심 목적으로 개인정보를 처리합니다.

3. 고충처리
민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보 목적으로 개인정보를 처리합니다.

제2조 (개인정보의 처리 및 보유 기간)
① ta-Go는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.

② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
1. 회원가입 및 관리 : 서비스 이용계약 또는 회원가입 해지시까지
2. 재화 또는 서비스 제공 : 재화·서비스 공급완료 및 요금결제·정산 완료시까지

제3조 (개인정보의 제3자 제공)
① ta-Go는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.

제4조 (개인정보처리의 위탁)
① ta-Go는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.

1. 전자결제 서비스
- 위탁받는 자 (수탁자) : 결제 서비스 제공업체
- 위탁하는 업무의 내용 : 결제 처리

② ta-Go는 위탁계약 체결시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.

제5조 (정보주체의 권리·의무 및 그 행사방법)
① 정보주체는 ta-Go에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.

② 제1항에 따른 권리 행사는 ta-Go에 대해 개인정보 보호법 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 ta-Go는 이에 대해 지체 없이 조치하겠습니다.

③ 제1항에 따른 권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다. 이 경우 "개인정보 처리 방법에 관한 고시(제2020-7호)" 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.

④ 개인정보 열람 및 처리정지 요구는 개인정보보호법 제35조 제4항, 제37조 제2항에 의하여 정보주체의 권리가 제한 될 수 있습니다.

⑤ 개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집 대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수 없습니다.

⑥ ta-Go는 정보주체 권리에 따른 열람의 요구, 정정·삭제의 요구, 처리정지의 요구 시 열람 등 요구를 한 자가 본인이거나 정당한 대리인인지를 확인합니다.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrivacyModalClose} color="primary">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SignupComponent;
