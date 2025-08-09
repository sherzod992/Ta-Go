import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Button, Stack } from '@mui/material';

const CSNav: React.FC = () => {
  const router = useRouter();
  const items = [
    { href: '/cs/faq', label: 'FAQ' },
    { href: '/cs/inquiry', label: '1:1 문의' },
    { href: '/contact', label: '연락처' },
    { href: '/cs/terms', label: '약관' },
  ];

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', mb: 3 }}>
      <Stack direction="row" spacing={1}>
        {items.map((item) => {
          const isActive = router.asPath === item.href || router.asPath.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <Button variant={isActive ? 'contained' : 'outlined'} size="small">
                {item.label}
              </Button>
            </Link>
          );
        })}
      </Stack>
    </Box>
  );
};

export default CSNav;


