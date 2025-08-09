import React, { useState } from 'react';
import { Box, Stack, TextField, Button } from '@mui/material';

interface FAQSearchProps {
  onSearch?: (keyword: string) => void;
  defaultValue?: string;
}

const FAQSearch: React.FC<FAQSearchProps> = ({ onSearch, defaultValue = '' }) => {
  const [keyword, setKeyword] = useState<string>(defaultValue);

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          placeholder="원하는 도움말을 검색하세요"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={() => onSearch?.(keyword)}
        >
          검색
        </Button>
      </Stack>
    </Box>
  );
};

export default FAQSearch;


