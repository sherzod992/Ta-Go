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
import { GET_ALL_PROPERTIES_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_PROPERTY_BY_ADMIN, REMOVE_PROPERTY_BY_ADMIN } from '../../../apollo/admin/mutation';
import { REACT_APP_API_URL } from '../../../libs/config';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';

type AdminProperty = {
  _id: string;
  propertyType?: string;
  propertyStatus?: string;
  propertyLocation?: string;
  propertyAddress?: string;
  propertyTitle?: string;
  propertyPrice?: number;
  propertyBrand?: string;
  propertyModel?: string;
  propertyYear?: number;
  propertyMileage?: number;
  propertyEngineSize?: number;
  propertyFuelType?: string;
  propertyTransmission?: string;
  propertyColor?: string;
  propertyCondition?: string;
  propertyViews?: number;
  propertyLikes?: number;
  propertyComments?: number;
  propertyRank?: number;
  propertyImages?: string[];
  propertyDesc?: string;
  memberData?: {
    _id: string;
    memberNick?: string;
    memberFullName?: string;
    memberImage?: string;
  } | null;
};

const buildImageUrl = (path?: string) => {
  if (!path) return '/img/typeImages/type1.png';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = REACT_APP_API_URL || '';
  return base ? `${base}/${path}` : path;
};

const PropertiesAdminPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [locationInput, setLocationInput] = useState<string>('');

  const locations = useMemo(() => {
    const arr = locationInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return arr.length ? arr : undefined;
  }, [locationInput]);

  const variables = useMemo(
    () => ({
      input: {
        page: page + 1,
        limit: rowsPerPage,
        search: {
          ...(status ? { propertyStatus: status } : {}),
          ...(locations ? { propertyLocationList: locations } : {}),
        },
      },
    }),
    [page, rowsPerPage, status, locations]
  );

  const { data, loading, refetch } = useQuery(GET_ALL_PROPERTIES_BY_ADMIN, {
    variables,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const [updateProperty, { loading: updating }] = useMutation(UPDATE_PROPERTY_BY_ADMIN);
  const [removeProperty, { loading: removing }] = useMutation(REMOVE_PROPERTY_BY_ADMIN);

  const list: AdminProperty[] = data?.getAllPropertiesByAdmin?.list ?? [];
  const total: number = data?.getAllPropertiesByAdmin?.metaCounter?.total ?? 0;

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusChange = async (id: string, nextStatus: string) => {
    await updateProperty({ variables: { input: { _id: id, propertyStatus: nextStatus } } });
    await refetch();
  };

  const handleDelete = async (id: string) => {
    await removeProperty({ variables: { input: id } });
    await refetch();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Admin · Properties</Typography>
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
              <MenuItem value="SOLD">SOLD</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Locations (comma separated)"
            value={locationInput}
            onChange={(e) => {
              setLocationInput(e.target.value);
              setPage(0);
            }}
          />
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
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Views</TableCell>
                <TableCell align="right">Likes</TableCell>
                <TableCell align="right">Comments</TableCell>
                <TableCell>Member</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((p) => {
                const img = buildImageUrl(p.propertyImages?.[0]);
                const isActive = p.propertyStatus === 'ACTIVE';
                return (
                  <TableRow key={p._id} hover>
                    <TableCell>
                      <Avatar variant="rounded" src={img} sx={{ width: 64, height: 48 }} />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        {isActive ? (
                          <Link href={`/property/${p._id}`}>
                            <Typography variant="subtitle2" color="primary" sx={{ cursor: 'pointer' }}>
                              {p.propertyTitle || `${p.propertyBrand ?? ''} ${p.propertyModel ?? ''}`}
                            </Typography>
                          </Link>
                        ) : (
                          <Typography variant="subtitle2">
                            {p.propertyTitle || `${p.propertyBrand ?? ''} ${p.propertyModel ?? ''}`}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {p.propertyDesc?.slice(0, 80)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{p.propertyType}</TableCell>
                    <TableCell>
                      <Chip size="small" label={p.propertyStatus} color={p.propertyStatus === 'ACTIVE' ? 'success' : p.propertyStatus === 'SOLD' ? 'warning' : 'default'} />
                    </TableCell>
                    <TableCell>{p.propertyLocation}</TableCell>
                    <TableCell align="right">{p.propertyPrice?.toLocaleString?.() ?? '-'}</TableCell>
                    <TableCell align="right">{p.propertyViews ?? 0}</TableCell>
                    <TableCell align="right">{p.propertyLikes ?? 0}</TableCell>
                    <TableCell align="right">{p.propertyComments ?? 0}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar src={buildImageUrl(p.memberData?.memberImage || undefined)} sx={{ width: 24, height: 24 }} />
                        <Typography variant="body2">{p.memberData?.memberNick || p.memberData?.memberFullName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Set ACTIVE">
                          <span>
                            <IconButton size="small" onClick={() => handleStatusChange(p._id, 'ACTIVE')} disabled={updating}>
                              ✅
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Set SOLD">
                          <span>
                            <IconButton size="small" onClick={() => handleStatusChange(p._id, 'SOLD')} disabled={updating}>
                              🟡
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Set DELETE (status)">
                          <span>
                            <IconButton size="small" onClick={() => handleStatusChange(p._id, 'DELETE')} disabled={updating}>
                              ❌
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete (remove)">
                          <span>
                            <IconButton size="small" onClick={() => handleDelete(p._id)} disabled={removing}>
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
                  <TableCell colSpan={11} align="center">
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

export default withAdminLayout(PropertiesAdminPage);


