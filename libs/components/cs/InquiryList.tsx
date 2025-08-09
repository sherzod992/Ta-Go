import React from 'react';
import { Chip, Divider, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';
import Link from 'next/link';

const mock = [
  { id: 'inq-1', title: '결제 취소 관련 문의', status: 'ANSWERED', createdAt: '2024-07-01' },
  { id: 'inq-2', title: '비밀번호 초기화가 안돼요', status: 'OPEN', createdAt: '2024-07-02' },
];

const statusColor: Record<string, 'default' | 'success' | 'warning' | 'info' | 'error'> = {
  OPEN: 'info',
  HOLD: 'warning',
  ANSWERED: 'success',
  CLOSED: 'default',
};

const InquiryList: React.FC = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>내 문의</Typography>
        <Typography variant="body2" color="text.secondary">최신순</Typography>
      </Stack>
      <Divider />
      <List>
        {mock.map((i) => (
          <Link key={i.id} href={`/cs/inquiry/${i.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem button>
              <ListItemText primary={i.title} secondary={i.createdAt} />
              <Chip size="small" label={i.status} color={statusColor[i.status]} />
            </ListItem>
          </Link>
        ))}
      </List>
    </Paper>
  );
};

export default InquiryList;


