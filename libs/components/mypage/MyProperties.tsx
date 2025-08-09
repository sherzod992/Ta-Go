import React, { useMemo, useState } from 'react';
import { useReactiveVar, useMutation, useQuery } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_AGENT_PROPERTIES } from '../../../apollo/user/query';
import { UPDATE_PROPERTY, CREATE_PROPERTY } from '../../../apollo/user/mutation';
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
} from '@mui/material';

type Props = { mode?: 'create' | 'list' };

const MyProperties: React.FC<Props> = ({ mode = 'list' }) => {
  const user = useReactiveVar(userVar);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [status, setStatus] = useState('');

  const variables = useMemo(
    () => ({
      input: {
        page: page + 1,
        limit: rowsPerPage,
        memberId: user?._id,
        ...(status ? { search: { propertyStatus: status } } : {}),
      },
    }),
    [page, rowsPerPage, status, user?._id]
  );

  const { data, loading, refetch } = useQuery(GET_AGENT_PROPERTIES, { variables, skip: typeof window === 'undefined' || !user?._id });
  const [updateProperty] = useMutation(UPDATE_PROPERTY);

  const list = data?.getAgentProperties?.list ?? [];
  const total = data?.getAgentProperties?.metaCounter?.total ?? 0;

  if (!user?._id) return null;

  if (mode === 'create') {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Add New Property (간단 템플릿)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          실제 이미지 업로드/폼은 추후 연결합니다.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="SOLD">SOLD</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={() => refetch()} disabled={loading}>
            Refetch
          </Button>
        </Stack>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((p: any) => (
              <TableRow key={p._id}>
                <TableCell>{p.propertyTitle}</TableCell>
                <TableCell>{p.propertyStatus}</TableCell>
                <TableCell>{p.propertyPrice?.toLocaleString?.()}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={async () => {
                      await updateProperty({ variables: { input: { _id: p._id, propertyStatus: 'ACTIVE' } } });
                      await refetch();
                    }}>ACTIVE</Button>
                    <Button size="small" onClick={async () => {
                      await updateProperty({ variables: { input: { _id: p._id, propertyStatus: 'SOLD' } } });
                      await refetch();
                    }}>SOLD</Button>
                    <Button size="small" onClick={async () => {
                      await updateProperty({ variables: { input: { _id: p._id, propertyStatus: 'DELETE' } } });
                      await refetch();
                    }}>DELETE</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {list.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">{loading ? 'Loading...' : 'No data'}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
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

export default MyProperties;


