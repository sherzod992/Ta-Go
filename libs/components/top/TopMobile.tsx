import React from 'react';
import { Box, Button, Typography, Menu, MenuItem, Avatar, IconButton } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';

const TopMobile: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [languageAnchorEl, setLanguageAnchorEl] = React.useState<null | HTMLElement>(null);

  // 언어 옵션
  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ];

  const currentLanguage = languages.find(lang => lang.code === router.locale) || languages[0];

  const handleLogout = () => {
    logOut();
  };

  const handleLanguageMenu = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchorEl(null);
  };

  const handleLanguageChange = (languageCode: string) => {
    console.log('언어 변경 시도:', languageCode, '현재 언어:', router.locale);
    
    // 현재 언어와 같으면 메뉴만 닫기
    if (languageCode === router.locale) {
      console.log('같은 언어 선택됨, 메뉴만 닫기');
      handleLanguageClose();
      return;
    }
    
    // 무한 루프 방지
    const lastLanguageChange = sessionStorage.getItem('lastLanguageChange');
    const now = Date.now();
    
    if (lastLanguageChange && (now - parseInt(lastLanguageChange)) < 2000) {
      console.warn('너무 빠른 언어 변경 시도가 감지되어 무시됩니다.');
      handleLanguageClose();
      return;
    }
    
    sessionStorage.setItem('lastLanguageChange', now.toString());
    
    const { pathname, query } = router;
    console.log('언어 변경 실행:', { pathname, query, locale: languageCode });
    
    // 안전한 언어 변경
    try {
      const newUrl = `/${languageCode}${pathname}`;
      console.log('새 URL:', newUrl);
      
      // 페이지 이동으로 언어 변경
      window.location.href = newUrl;
    } catch (error) {
      console.error('언어 변경 중 오류:', error);
      // 오류 시 홈페이지로 이동
      window.location.href = `/${languageCode}`;
    }
    
    handleLanguageClose();
  };

  return (
    <>
      <Box component="nav" className="top-mobile">
        {/* Left Section - Navigation Buttons */}
        <Box className="left-section">
          <Link href="/property?type=sell">
            <Button className="nav-button sell-button">
              {t('Sell')}
            </Button>
          </Link>
          <Link href="/property?type=buy">
            <Button className="nav-button buy-button">
              {t('Buy')}
            </Button>
          </Link>
          <Link href="/agent">
            <Button className="nav-button agents-button">
              {t('Agents')}
            </Button>
          </Link>
        </Box>

        {/* Center Section - Logo */}
        <Box className="center-section">
          <Link href="/">
            <Typography variant="h6" component="div" className="logo">
              ta-Go
            </Typography>
          </Link>
        </Box>

        {/* Right Section - Language & Login */}
        <Box className="right-section">
          {/* Language Selector */}
          <IconButton className="language-selector" onClick={handleLanguageMenu}>
            <span className="flag">{currentLanguage.flag}</span>
          </IconButton>
          
          {/* Login/User Button */}
          {user?._id ? (
            <Link href="/mypage">
              <Avatar src={user.memberImage} alt={user.memberNick} className="user-avatar" />
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="contained" color="primary" className="login-button">
                {t('Login')}
              </Button>
            </Link>
          )}
        </Box>
      </Box>

      {/* Language Menu */}
      <Menu
        anchorEl={languageAnchorEl}
        open={Boolean(languageAnchorEl)}
        onClose={handleLanguageClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={language.code === currentLanguage.code}
            disabled={false}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{language.flag}</span>
            <Typography variant="body2">{language.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default TopMobile;
