import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import Link from 'next/link';

const mock = [
  { id: 'n1', title: '서비스 점검 안내 (7/10 02:00~04:00)', date: '2024-07-05' },
  { id: 'n2', title: '개인정보 처리방침 업데이트', date: '2024-07-01' },
];

interface NoticeListProps {
  limit?: number;
}

const NoticeList: React.FC<NoticeListProps> = ({ limit }) => {
  const list = typeof limit === 'number' ? mock.slice(0, limit) : mock;
  return (
    <List>
      {list.map((n) => (
        <Link key={n.id} href={`/cs/terms`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <ListItem button>
            <ListItemText primary={n.title} secondary={n.date} />
          </ListItem>
        </Link>
      ))}
    </List>
  );
};

export default NoticeList;


