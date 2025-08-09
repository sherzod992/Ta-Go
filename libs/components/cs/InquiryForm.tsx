import React, { useState } from 'react';
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';

const categories = [
  { value: 'ACCOUNT', label: '계정' },
  { value: 'LISTING', label: '매물' },
  { value: 'PAYMENT', label: '결제' },
  { value: 'ETC', label: '기타' },
];

const InquiryForm: React.FC = () => {
  const [category, setCategory] = useState('ACCOUNT');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>1:1 문의하기</Typography>
      <Stack spacing={2}>
        <TextField
          select
          label="카테고리"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
          ))}
        </TextField>
        <TextField label="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField label="내용" value={content} onChange={(e) => setContent(e.target.value)} multiline minRows={5} />
        <Box>
          <Button variant="contained" disabled>
            제출 (준비 중)
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default InquiryForm;


