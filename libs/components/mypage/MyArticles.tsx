import React, { useMemo, useState } from 'react';
import { useReactiveVar, useQuery } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { Paper, List, ListItem, ListItemText, TablePagination } from '@mui/material';

const MyArticles: React.FC = () => {
  const user = useReactiveVar(userVar);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const variables = useMemo(
    () => ({ input: { page: page + 1, limit: rowsPerPage, search: { memberId: user?._id } } }),
    [page, rowsPerPage, user?._id]
  );
  const { data, loading } = useQuery(GET_BOARD_ARTICLES, { variables, skip: typeof window === 'undefined' || !user?._id });
  const list = data?.getBoardArticles?.list ?? [];
  const total = data?.getBoardArticles?.metaCounter?.total ?? 0;

  if (!user?._id) return null;

  return (
    <Paper>
      {list.map((a: any) => (
        <List key={a._id}>
          <ListItem divider>
            <ListItemText primary={a.articleTitle} secondary={a.articleCategory} />
          </ListItem>
        </List>
      ))}
      {list.length === 0 && !loading && (
        <List>
          <ListItem>
            <ListItemText primary="No articles" />
          </ListItem>
        </List>
      )}
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

export default MyArticles;


