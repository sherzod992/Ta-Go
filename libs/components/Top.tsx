import React from 'react';
import { Box, Button, Typography, Menu, MenuItem, Avatar, Badge, IconButton } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { logOut } from '../auth';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Top: React.FC = () => {
  const { t } = useTranslation();
  const user = useReactiveVar(userVar);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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

      {/* Right Section - Notifications & Login/User */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
              Welcome, {user.memberNick || 'User'}
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
                  My Profile
                </Link>
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                Logout
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
