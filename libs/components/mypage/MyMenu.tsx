import React from 'react';
import Link from 'next/link';
import { Box, List, ListItemButton, ListItemText, Paper } from '@mui/material';

const items = [
  { key: 'profile', label: 'My Profile' },
  { key: 'properties', label: 'My Properties' },
  { key: 'favorites', label: 'My Favorites' },
  { key: 'visited', label: 'Recently Visited' },
  { key: 'articles', label: 'My Articles' },
  { key: 'chat', label: 'My Chats' },
  { key: 'add', label: 'Add New Property' },
];

const MyMenu: React.FC<{ active: string }> = ({ active }) => {
  return (
    <Paper>
      <List>
        {items.map((it) => (
          <Link key={it.key} href={{ pathname: '/mypage', query: { category: it.key } }}>
            <ListItemButton selected={active === it.key}>
              <ListItemText primary={it.label} />
            </ListItemButton>
          </Link>
        ))}
      </List>
    </Paper>
  );
};

export default MyMenu;


