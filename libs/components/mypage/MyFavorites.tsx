import React, { useMemo, useState } from 'react';
import { useReactiveVar, useQuery } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { Paper, List, ListItem, ListItemText, ListItemButton, ListItemAvatar, Avatar, TablePagination } from '@mui/material';

const MyFavorites: React.FC = () => {
  const user = useReactiveVar(userVar);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const variables = useMemo(
    () => ({ input: { page: page + 1, limit: rowsPerPage, memberId: user?._id } }),
    [page, rowsPerPage, user?._id]
  );
  const { data, loading } = useQuery(GET_FAVORITES, { variables, skip: typeof window === 'undefined' || !user?._id });
  const list = data?.getFavorites?.list ?? [];
  const total = data?.getFavorites?.metaCounter?.total ?? 0;

  if (!user?._id) return null;

  return (
    <Paper>
      <List>
        {list.map((p: any) => (
          <ListItem key={p._id} divider secondaryAction={<span>{p.propertyPrice?.toLocaleString?.()}</span>}>
            <ListItemAvatar>
              <Avatar variant="rounded" src={p.propertyImages?.[0]} />
            </ListItemAvatar>
            <ListItemText primary={p.propertyTitle} secondary={`${p.propertyBrand ?? ''} ${p.propertyModel ?? ''}`} />
          </ListItem>
        ))}
        {list.length === 0 && !loading && (
          <ListItem>
            <ListItemText primary="No favorites" />
          </ListItem>
        )}
      </List>
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
      />
    </Paper>
  );
};

export default MyFavorites;


