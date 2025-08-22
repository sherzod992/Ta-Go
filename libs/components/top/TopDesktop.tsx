import React from 'react';
import { Box, Button, Typography, Menu, MenuItem, Avatar, Badge, IconButton, Tooltip } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import { MemberType } from '../../enums/member.enum';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { NotificationIcon } from '../common/NotificationIcon';

const TopDesktop: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [languageAnchorEl, setLanguageAnchorEl] = React.useState<null | HTMLElement>(null);
  const [adminAnchorEl, setAdminAnchorEl] = React.useState<null | HTMLElement>(null);

  // 언어 옵션
  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ];

  const currentLanguage = languages.find(lang => lang.code === router.locale) || languages[0];

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logOut();
    handleClose();
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

  const handleAdminMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAdminAnchorEl(event.currentTarget);
  };

  const handleAdminClose = () => {
    setAdminAnchorEl(null);
  };

  return (
    <Box component="nav" className="top-pc">
      {/* Logo */}
      <Box className="logo">
        <Link href="/">
          <Typography variant="h5" component="div">
            ta-Go
          </Typography>
        </Link>
      </Box>

      {/* Navigation Menu */}
      <Box className="navigation">
        <Link href="/" className="nav-item">
          {t('Home')}
        </Link>
        <Link href="/property?type=buy" className="nav-item">
          {t('Buy')}
        </Link>
        <Link href="/property?type=sell" className="nav-item">
          {t('Sell')}
        </Link>
        <Link href="/agent" className="nav-item">
          {t('Agents')}
        </Link>
        <Link href="/community?articleCategory=FREE" className="nav-item">
          {t('Community')}
        </Link>
        <Link href="/cs" className="nav-item">
          {t('CS')}
        </Link>
        {user?.memberType === MemberType.ADMIN && (
          <Button
            className="nav-item admin-nav"
            onClick={handleAdminMenu}
            startIcon={<AdminPanelSettingsIcon />}
            sx={{
              color: 'primary.main',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
              }
            }}
          >
            {t('Admin')}
          </Button>
        )}
      </Box>

      {/* Right Section - Notifications, Language & Login/User */}
      <Box className="right-section">
        {/* Language Selector */}
        <Tooltip title={t('Language Selection')}>
          <IconButton className="language-selector" onClick={handleLanguageMenu}>
            <span className="flag">{currentLanguage.flag}</span>
          </IconButton>
        </Tooltip>
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
          className="menu"
        >
          {languages.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              selected={language.code === currentLanguage.code}
              className="menu-item"
              disabled={false}
            >
              <span className="flag">{language.flag}</span>
              <Typography variant="body2">{language.name}</Typography>
            </MenuItem>
          ))}
        </Menu>

        {/* Chat Notifications */}
        {user?._id && (
          <NotificationIcon userId={user._id} />
        )}

        {/* General Notifications */}
        <IconButton className="notifications">
          <Badge badgeContent={0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* Login/User Section */}
        {user?._id ? (
          <Box className="user-section">
            <Typography variant="body2" className="welcome-text">
              {t('Welcome')}, {user.memberNick || t('User')}
            </Typography>
            <Avatar
              src={user.memberImage}
              alt={user.memberNick}
              className="avatar"
              onClick={handleMenu}
            />
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleClose}>
                <Link href="/mypage" style={{ textDecoration: 'none', color: 'inherit' }}>
                  {t('My Profile')}
                </Link>
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                {t('Logout')}
              </MenuItem>
                    </Menu>

        {/* Admin Menu */}
        {user?.memberType === MemberType.ADMIN && (
          <Menu
            anchorEl={adminAnchorEl}
            open={Boolean(adminAnchorEl)}
            onClose={handleAdminClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            className="menu"
          >
            <MenuItem onClick={() => { router.push('/_admin/properties'); handleAdminClose(); }}>
              <Typography variant="body2">{t('Properties Management')}</Typography>
            </MenuItem>
            <MenuItem onClick={() => { router.push('/_admin/community'); handleAdminClose(); }}>
              <Typography variant="body2">{t('Community Management')}</Typography>
            </MenuItem>
            <MenuItem onClick={() => { router.push('/_admin/cs'); handleAdminClose(); }}>
              <Typography variant="body2">{t('CS Management')}</Typography>
            </MenuItem>
          </Menu>
        )}
      </Box>
        ) : (
          <Link href="/login" className="login-button">
            <Button variant="contained" color="primary">
              {t('Login')}
            </Button>
          </Link>
        )}
      </Box>
    </Box>
  );
};

export default TopDesktop;
