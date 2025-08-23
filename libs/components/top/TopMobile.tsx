import React from 'react';
import { Box, Button, Typography, Menu, MenuItem, Avatar, IconButton, Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SellIcon from '@mui/icons-material/Sell';
import PersonIcon from '@mui/icons-material/Person';
import ForumIcon from '@mui/icons-material/Forum';
import SupportIcon from '@mui/icons-material/Support';

const TopMobile: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [languageAnchorEl, setLanguageAnchorEl] = React.useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // 언어 옵션
  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ];

  const currentLanguage = languages.find(lang => lang.code === router.locale) || languages[0];

  // 메뉴 아이템들
  const menuItems = [
    { text: t('Home'), href: '/', icon: <HomeIcon /> },
    { text: t('Buy'), href: '/property?type=buy', icon: <ShoppingCartIcon /> },
    { text: t('Sell'), href: '/property?type=sell', icon: <SellIcon /> },
    { text: t('Agents'), href: '/agent', icon: <PersonIcon /> },
    { text: t('Community'), href: '/community?articleCategory=FREE', icon: <ForumIcon /> },
    { text: t('CS'), href: '/cs', icon: <SupportIcon /> },
  ];

  const handleLogout = () => {
    logOut();
    setDrawerOpen(false);
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

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuItemClick = (href: string) => {
    setDrawerOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* 모바일 Top 네비게이션 - 요구사항에 맞게 수정 */}
      <Box component="nav" className="top-mobile" sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: '60px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        {/* 1. 햄버거 메뉴 버튼 */}
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            color: '#333',
            padding: '8px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* 2. 로고 */}
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{
              fontWeight: 'bold',
              margin: 0,
              fontSize: '1.5rem',
              color: '#667eea'
            }}
          >
            ta-Go
          </Typography>
        </Link>

        {/* 3. 언어 선택 버튼 */}
        <IconButton 
          onClick={handleLanguageMenu}
          sx={{
            color: '#333',
            padding: '8px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>{currentLanguage.flag}</span>
        </IconButton>
        
        {/* 4. 로그인/사용자 버튼 */}
        {user?._id ? (
          <Link href="/mypage">
            <Avatar 
              src={user.memberImage} 
              alt={user.memberNick} 
              sx={{
                width: '32px',
                height: '32px',
                cursor: 'pointer'
              }}
            />
          </Link>
        ) : (
          <Link href="/login">
            <Button 
              variant="contained" 
              color="primary" 
              size="small"
              sx={{
                padding: '4px 12px',
                fontSize: '0.8rem',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '4px',
                minWidth: 'auto',
                height: '32px'
              }}
            >
              {t('Login')}
            </Button>
          </Link>
        )}
      </Box>

      {/* 햄버거 메뉴 드로어 */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: '280px',
            boxSizing: 'border-box'
          }
        }}
      >
        <Box sx={{ padding: '16px' }}>
          {/* 사용자 정보 섹션 */}
          {user?._id ? (
            <Box sx={{ 
              padding: '16px', 
              borderBottom: '1px solid #e0e0e0', 
              marginBottom: '16px' 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <Avatar 
                  src={user.memberImage} 
                  alt={user.memberNick}
                  sx={{ width: '48px', height: '48px' }}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    {user.memberNick || t('User')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                    {user.memberPhone}
                  </Typography>
                </Box>
              </Box>
              <Button 
                variant="outlined" 
                color="error" 
                size="small" 
                onClick={handleLogout}
                sx={{ width: '100%', marginTop: '8px' }}
              >
                {t('Logout')}
              </Button>
            </Box>
          ) : (
            <Box sx={{ 
              padding: '16px', 
              borderBottom: '1px solid #e0e0e0', 
              marginBottom: '16px' 
            }}>
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                {t('Welcome')}
              </Typography>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={() => setDrawerOpen(false)}
                >
                  {t('Login')}
                </Button>
              </Link>
            </Box>
          )}

          {/* 메뉴 아이템들 */}
          <List>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.text}>
                <ListItem 
                  button 
                  onClick={() => handleMenuItemClick(item.href)}
                  sx={{
                    borderRadius: '4px',
                    marginBottom: '4px',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.1)'
                    }
                  }}
                >
                  <Box sx={{ marginRight: '16px', color: '#667eea' }}>
                    {item.icon}
                  </Box>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ fontWeight: 500 }}
                  />
                </ListItem>
                {index < menuItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* 언어 선택 메뉴 */}
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
