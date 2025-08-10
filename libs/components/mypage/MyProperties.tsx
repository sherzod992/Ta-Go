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
import { sweetMixinSuccessAlert } from '../../sweetAlert';

type Props = { mode?: 'create' | 'list' };

const MyProperties: React.FC<Props> = ({ mode = 'list' }) => {
  const user = useReactiveVar(userVar);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [status, setStatus] = useState('ACTIVE'); // 기본값을 ACTIVE로 설정

  const variables = useMemo(
    () => ({
      input: {
        page: page + 1,
        limit: rowsPerPage,
        search: {
          ...(status ? { propertyStatus: status } : {}),
        },
      },
    }),
    [page, rowsPerPage, status]
  );

  const { data, loading, refetch } = useQuery(GET_AGENT_PROPERTIES, { variables, skip: typeof window === 'undefined' || !user?._id });
  const [updateProperty] = useMutation(UPDATE_PROPERTY);

  const list = data?.getAgentProperties?.list ?? [];
  const total = data?.getAgentProperties?.metaCounter?.total ?? 0;

  if (!user?._id) return null;

  // 상태 변경 핸들러
  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      await updateProperty({ 
        variables: { 
          input: { 
            _id: propertyId, 
            propertyStatus: newStatus 
          } 
        } 
      });
      
      // 성공 메시지 표시
      await sweetMixinSuccessAlert(`매물 상태가 ${newStatus}로 변경되었습니다!`);
      
      // 데이터 새로고침
      await refetch();
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

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
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="SOLD">SOLD</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
              <MenuItem value="">All</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={() => refetch()} disabled={loading}>
            새로고침
          </Button>
        </Stack>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>제목</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>가격</TableCell>
              <TableCell>액션</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((p: any) => (
              <TableRow key={p._id}>
                <TableCell>{p.propertyTitle}</TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: p.propertyStatus === 'ACTIVE' ? 'success.main' : 
                             p.propertyStatus === 'SOLD' ? 'warning.main' : 'error.main'
                    }}
                  >
                    {p.propertyStatus}
                  </Typography>
                </TableCell>
                <TableCell>{p.propertyPrice?.toLocaleString?.()}원</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button 
                      size="small" 
                      onClick={() => handleStatusChange(p._id, 'ACTIVE')}
                      variant={p.propertyStatus === 'ACTIVE' ? 'contained' : 'outlined'}
                      color="success"
                      sx={{ 
                        fontWeight: 'bold',
                        minWidth: 80,
                        ...(p.propertyStatus !== 'ACTIVE' && {
                          '&:hover': {
                            backgroundColor: 'success.light',
                            color: 'white'
                          }
                        })
                      }}
                    >
                      ACTIVE
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => handleStatusChange(p._id, 'SOLD')}
                      variant={p.propertyStatus === 'SOLD' ? 'contained' : 'outlined'}
                      color="warning"
                      sx={{ 
                        fontWeight: 'bold',
                        minWidth: 80,
                        ...(p.propertyStatus !== 'SOLD' && {
                          '&:hover': {
                            backgroundColor: 'warning.light',
                            color: 'white'
                          }
                        })
                      }}
                    >
                      SOLD
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => handleStatusChange(p._id, 'DELETE')}
                      variant={p.propertyStatus === 'DELETE' ? 'contained' : 'outlined'}
                      color="error"
                      sx={{ 
                        fontWeight: 'bold',
                        minWidth: 80,
                        ...(p.propertyStatus !== 'DELETE' && {
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'white'
                          }
                        })
                      }}
                    >
                      DELETE
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {list.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {loading ? '로딩 중...' : '데이터가 없습니다'}
                </TableCell>
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


