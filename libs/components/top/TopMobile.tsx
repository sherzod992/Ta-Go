import React from 'react';
import { Box, Button, Typography, Menu, MenuItem, Avatar, Badge, IconButton, Drawer, List, ListItem, ListItemText, ListItemAvatar, Divider } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { NotificationIcon } from '../common/NotificationIcon';

const TopMobile: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [languageAnchorEl, setLanguageAnchorEl] = React.useState<null | HTMLElement>(null);

  // 언어 옵션
  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ];

  const currentLanguage = languages.find(lang => lang.code === router.locale) || languages[0];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logOut();
    handleMobileMenuClose();
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

  const navigationItems = [
    { href: '/', label: t('Home') },
    { href: '/property?type=buy', label: t('Buy') },
    { href: '/property?type=sell', label: t('Sell') },
    { href: '/agent', label: t('Agents') },
    { href: '/community?articleCategory=FREE', label: t('Community') },
    { href: '/cs', label: t('CS') },
  ];

  return (
    <>
      <Box component="nav" className="top-mobile">
        {/* Logo */}
        <Box className="logo">
          <Link href="/">
            <Typography variant="h6" component="div">
              ta-Go
            </Typography>
          </Link>
        </Box>

        {/* Right Section - Language & Menu Toggle */}
        <Box className="right-section">
          {/* Chat Notifications */}
          {user?._id && (
            <NotificationIcon userId={user._id} />
          )}

          {/* Language Selector */}
          <IconButton className="language-selector" onClick={handleLanguageMenu}>
            <span className="flag">{currentLanguage.flag}</span>
          </IconButton>
          
          {/* Mobile Menu Toggle */}
          <IconButton className="mobile-menu-toggle" onClick={handleMobileMenuToggle}>
            <MenuIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Mobile Menu Drawer */}
      <Box className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <Box className="menu-content">
          {/* Menu Header */}
          <Box className="menu-header">
            <Typography variant="h6">메뉴</Typography>
            <IconButton className="close-button" onClick={handleMobileMenuToggle}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Navigation Section */}
          <Box className="nav-section">
            <Typography variant="subtitle1" className="nav-title">
              메뉴
            </Typography>
            <Box className="nav-items">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-item"
                  onClick={handleMobileMenuClose}
                >
                  {item.label}
                </Link>
              ))}
            </Box>
          </Box>

          {/* User Section */}
          <Box className="user-section">
            {user?._id ? (
              <>
                <Box className="user-info">
                  <Avatar src={user.memberImage} alt={user.memberNick} className="avatar" />
                  <Box className="user-details">
                    <Typography variant="subtitle1" className="user-name">
                      {user.memberNick || t('User')}
                    </Typography>
                    <Typography variant="body2" className="user-email">
                      {user.memberNick || ''}
                    </Typography>
                  </Box>
                </Box>
                <Box className="user-actions">
                  <Link href="/mypage" className="action-button" onClick={handleMobileMenuClose}>
                    {t('My Profile')}
                  </Link>
                  <Button className="action-button logout" onClick={handleLogout}>
                    {t('Logout')}
                  </Button>
                </Box>
              </>
            ) : (
              <Link href="/login" className="action-button" onClick={handleMobileMenuClose}>
                <Button variant="contained" color="primary" fullWidth>
                  {t('Login')}
                </Button>
              </Link>
            )}
          </Box>
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
