import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';

const Top: React.FC = () => {
  const { t } = useTranslation();
  const user = useReactiveVar(userVar);

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
        <Link href={'/property'} style={{ textDecoration: 'none' }}>
          <Box
            component="div"
            sx={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f5f5f5', borderRadius: 1 },
            }}
          >
            {t('Properties')}
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
        {user?._id && (
          <Link href={'/mypage'} style={{ textDecoration: 'none' }}>
            <Box
              component="div"
              sx={{
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f5f5f5', borderRadius: 1 },
              }}
            >
              {t('My Page')}
            </Box>
          </Link>
        )}
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

      {/* Login/User Section */}
      <Box>
        {user?._id ? (
          <Typography variant="body2">
            Welcome, {user.memberNick || 'User'}
          </Typography>
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
