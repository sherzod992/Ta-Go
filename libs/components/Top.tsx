import React from 'react';
import { Box, Button, Typography, Menu, MenuItem, Avatar, Badge, IconButton, Tooltip } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { logOut } from '../auth';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';

const Top: React.FC = () => {
  const { t } = useTranslation();
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
    <Box
      component="nav"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <Box>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            ta-Go
          </Typography>
        </Link>
      </Box>

      {/* Navigation Menu */}
      <Box component={'div'} className={'router-box'} sx={{ display: 'flex', gap: 2 }}>
        <Link href={'/'} style={{ textDecoration: 'none' }}>
          <Box
            component="div"
            sx={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f5f5f5', borderRadius: 1 },
            }}
          >
            {t('Home')}
          </Box>
        </Link>
        <Link href={'/property?type=buy'} style={{ textDecoration: 'none' }}>
          <Box
            component="div"
            sx={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f5f5f5', borderRadius: 1 },
            }}
          >
            {t('Buy')}
          </Box>
        </Link>
        <Link href={'/property?type=sell'} style={{ textDecoration: 'none' }}>
          <Box
            component="div"
            sx={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f5f5f5', borderRadius: 1 },
            }}
          >
            {t('Sell')}
          </Box>
        </Link>
        <Link href={'/agent'} style={{ textDecoration: 'none' }}>
          <Box
            component="div"
            sx={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f5f5f5', borderRadius: 1 },
            }}
          >
            {t('Agents')}
          </Box>
        </Link>
        <Link href={'/community?articleCategory=FREE'} style={{ textDecoration: 'none' }}>
          <Box
            component="div"
            sx={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f5f5f5', borderRadius: 1 },
            }}
          >
            {t('Community')}
          </Box>
        </Link>
        <Link href={'/cs'} style={{ textDecoration: 'none' }}>
          <Box
            component="div"
            sx={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f5f5f5', borderRadius: 1 },
            }}
          >
            {t('CS')}
          </Box>
        </Link>
      </Box>

      {/* Right Section - Notifications, Language & Login/User */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Language Selector */}
        <Tooltip title={t('Language Selection')}>
          <IconButton
            onClick={handleLanguageMenu}
            sx={{
              color: 'text.secondary',
              '&:hover': { backgroundColor: '#f5f5f5' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <span style={{ fontSize: '1.2rem' }}>{currentLanguage.flag}</span>
              <LanguageIcon sx={{ fontSize: '1rem' }} />
            </Box>
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
        >
          {languages.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              selected={language.code === currentLanguage.code}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 120,
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{language.flag}</span>
              <Typography variant="body2">{language.name}</Typography>
            </MenuItem>
          ))}
        </Menu>

        {/* Notifications */}
        <IconButton
          sx={{
            color: 'text.secondary',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
        >
          <Badge badgeContent={0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* Login/User Section */}
        {user?._id ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {t('Welcome')}, {user.memberNick || t('User')}
            </Typography>
            <Avatar
              src={user.memberImage}
              alt={user.memberNick}
              sx={{ width: 32, height: 32, cursor: 'pointer' }}
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
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary">
              {t('Login')}
            </Button>
          </Link>
        )}
      </Box>
    </Box>
  );
};

export default Top;
