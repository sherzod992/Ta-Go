import React from 'react';
import { Box, Button, Typography, Menu, MenuItem, Avatar, Badge, IconButton, Tooltip } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import NotificationsIcon from '@mui/icons-material/Notifications';

const TopDesktop: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [languageAnchorEl, setLanguageAnchorEl] = React.useState<null | HTMLElement>(null);

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
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: languageCode });
    handleLanguageClose();
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
            >
              <span className="flag">{language.flag}</span>
              <Typography variant="body2">{language.name}</Typography>
            </MenuItem>
          ))}
        </Menu>

        {/* Notifications */}
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
