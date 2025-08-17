import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Container,
  useScrollTrigger,
  Slide,
  Avatar,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';

// 현대적인 앱바 스타일
const ModernAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  
  '& .MuiToolbar-root': {
    minHeight: 'clamp(60px, 8vw, 80px)',
    padding: '0 clamp(1rem, 4vw, 2rem)',
  },
  
  '& .nav-link': {
    color: '#333',
    fontWeight: 500,
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    textTransform: 'none',
    borderRadius: '12px',
    padding: '8px 16px',
    transition: 'all 0.3s ease',
    
    '&:hover': {
      background: 'rgba(25, 118, 210, 0.1)',
      color: '#1976d2',
      transform: 'translateY(-2px)',
    },
  },
  
  '& .logo': {
    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
}));

// 스크롤 시 숨김 효과
function HideOnScroll(props: { children: React.ReactElement }) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

interface ModernNavigationProps {
  user?: any;
  onLogin?: () => void;
  onLogout?: () => void;
}

const ModernNavigation: React.FC<ModernNavigationProps> = ({ 
  user, 
  onLogin, 
  onLogout 
}) => {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'Buy', path: '/buy' },
    { label: 'Sell', path: '/sell' },
    { label: 'Agents', path: '/agent' },
    { label: 'Community', path: '/community' },
    { label: 'CS', path: '/cs' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileOpen(false);
  };

  const isActive = (path: string) => router.pathname === path;

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        px: 2, 
        mb: 2 
      }}>
        <Typography className="logo">ta-Go</Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.label}
            button
            onClick={() => handleNavigation(item.path)}
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 1,
              background: isActive(item.path) ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              color: isActive(item.path) ? '#1976d2' : '#333',
              '&:hover': {
                background: 'rgba(25, 118, 210, 0.1)',
                color: '#1976d2',
              },
            }}
          >
            <ListItemText 
              primary={item.label}
              sx={{
                '& .MuiTypography-root': {
                  fontSize: '1rem',
                  fontWeight: isActive(item.path) ? 600 : 500,
                }
              }}
            />
          </ListItem>
        ))}
      </List>
      
      {user ? (
        <Box sx={{ p: 2, borderTop: '1px solid #eee', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ mr: 2, bgcolor: '#1976d2' }}>
              {user.nickname?.[0] || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {user.nickname || 'User'}
              </Typography>
              <Chip 
                label={user.memberType || 'User'} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Box>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              handleNavigation('/mypage');
              handleProfileMenuClose();
            }}
            sx={{ mb: 1 }}
          >
            My Page
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={onLogout}
            color="error"
          >
            Logout
          </Button>
        </Box>
      ) : (
        <Box sx={{ p: 2, borderTop: '1px solid #eee', mt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              handleNavigation('/login');
              onLogin?.();
            }}
            sx={{ mb: 1 }}
          >
            Login
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleNavigation('/login')}
          >
            Sign Up
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <HideOnScroll>
        <ModernAppBar position="fixed">
          <Toolbar>
            {/* 모바일 메뉴 버튼 */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* 로고 */}
            <Typography 
              variant="h6" 
              component="div" 
              className="logo"
              sx={{ flexGrow: { xs: 1, sm: 0 }, mr: { sm: 4 } }}
            >
              ta-Go
            </Typography>

            {/* 데스크톱 네비게이션 */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.label}
                  className="nav-link"
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    background: isActive(item.path) ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                    color: isActive(item.path) ? '#1976d2' : '#333',
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* 우측 아이콘들 */}
            <Box sx={{ flexGrow: 1 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="inherit">
                <SearchIcon />
              </IconButton>
              
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>

              {user ? (
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ ml: 1 }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                    {user.nickname?.[0] || 'U'}
                  </Avatar>
                </IconButton>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => handleNavigation('/login')}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </ModernAppBar>
      </HideOnScroll>

      {/* 모바일 드로어 */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // 모바일 성능 향상
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* 프로필 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <MenuItem onClick={() => {
          handleNavigation('/mypage');
          handleProfileMenuClose();
        }}>
          My Page
        </MenuItem>
        <MenuItem onClick={() => {
          handleNavigation('/mypage/chat');
          handleProfileMenuClose();
        }}>
          Messages
        </MenuItem>
        <MenuItem onClick={onLogout}>
          Logout
        </MenuItem>
      </Menu>

      {/* 툴바 높이만큼 여백 */}
      <Toolbar />
    </>
  );
};

export default ModernNavigation;
