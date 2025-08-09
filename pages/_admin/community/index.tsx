import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Stack,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  IconButton,
  Tooltip,
  Avatar,
  Button,
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_BOARD_ARTICLE_BY_ADMIN, REMOVE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { REACT_APP_API_URL } from '../../../libs/config';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';

type AdminArticle = {
  _id: string;
  articleCategory?: string;
  articleStatus?: string;
  articleTitle?: string;
  articleContent?: string;
  articleImage?: string;
  articleViews?: number;
  articleLikes?: number;
  articleComments?: number;
  memberData?: {
    _id: string;
    memberNick?: string;
    memberFullName?: string;
    memberImage?: string;
  } | null;
};

const buildImageUrl = (path?: string) => {
  if (!path) return '/img/home/home2.jpg';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = REACT_APP_API_URL || '';
  return base ? `${base}/${path}` : path;
};

const CommunityAdminPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  // const [keyword, setKeyword] = useState<string>(''); // 스키마 명세에 없으므로 보류

  const variables = useMemo(
    () => ({
      input: {
        page: page + 1,
        limit: rowsPerPage,
        search: {
          ...(status ? { articleStatus: status } : {}),
          ...(category ? { articleCategory: category } : {}),
        },
      },
    }),
    [page, rowsPerPage, status, category]
  );

  const { data, loading, refetch } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
    variables,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const [updateArticle, { loading: updating }] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
  const [removeArticle, { loading: removing }] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);

  const list: AdminArticle[] = data?.getAllBoardArticlesByAdmin?.list ?? [];
  const total: number = data?.getAllBoardArticlesByAdmin?.metaCounter?.total ?? 0;

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusChange = async (id: string, nextStatus: string) => {
    await updateArticle({ variables: { input: { _id: id, articleStatus: nextStatus } } });
    await refetch();
  };

  const handleDelete = async (id: string) => {
    await removeArticle({ variables: { input: id } });
    await refetch();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Admin · Community</Typography>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="news">news</MenuItem>
              <MenuItem value="review">review</MenuItem>
              <MenuItem value="guide">guide</MenuItem>
            </Select>
          </FormControl>
          {/* 키워드 검색은 백엔드 스키마 확정 시 재활성화 */}
          <Button variant="outlined" onClick={() => refetch()} disabled={loading || updating || removing}>
            Refetch
          </Button>
        </Stack>
      </Stack>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Views</TableCell>
                <TableCell align="right">Likes</TableCell>
                <TableCell align="right">Comments</TableCell>
                <TableCell>Member</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((a) => {
                const img = buildImageUrl(a.articleImage);
                const isActive = a.articleStatus === 'ACTIVE';
                return (
                  <TableRow key={a._id} hover>
                    <TableCell>
                      <Avatar variant="rounded" src={img} sx={{ width: 64, height: 48 }} />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        {isActive ? (
                          <Link href={`/community`}>
                            <Typography variant="subtitle2" color="primary" sx={{ cursor: 'pointer' }}>
                              {a.articleTitle}
                            </Typography>
                          </Link>
                        ) : (
                          <Typography variant="subtitle2">{a.articleTitle}</Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {a.articleContent?.slice(0, 80)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{a.articleCategory}</TableCell>
                    <TableCell>
                      <Chip size="small" label={a.articleStatus} color={a.articleStatus === 'ACTIVE' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="right">{a.articleViews ?? 0}</TableCell>
                    <TableCell align="right">{a.articleLikes ?? 0}</TableCell>
                    <TableCell align="right">{a.articleComments ?? 0}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar src={buildImageUrl(a.memberData?.memberImage || undefined)} sx={{ width: 24, height: 24 }} />
                        <Typography variant="body2">{a.memberData?.memberNick || a.memberData?.memberFullName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Set ACTIVE">
                          <span>
                            <IconButton size="small" onClick={() => handleStatusChange(a._id, 'ACTIVE')} disabled={updating}>
                              ✅
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Set DELETE (status)">
                          <span>
                            <IconButton size="small" onClick={() => handleStatusChange(a._id, 'DELETE')} disabled={updating}>
                              ❌
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete (remove)">
                          <span>
                            <IconButton size="small" onClick={() => handleDelete(a._id)} disabled={removing}>
                              🗑️
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    {loading ? 'Loading...' : 'No data'}
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
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>
    </Container>
  );
};

export default withAdminLayout(CommunityAdminPage);


