import React from 'react';
import { Paper, Typography } from '@mui/material';

const TermsViewer: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>이용약관</Typography>
      <Typography sx={{ whiteSpace: 'pre-wrap' }}>
        {`본 문서는 예시 약관입니다. 실제 약관 내용으로 대체해주세요.

1. 목적
2. 용어의 정의
3. 회원가입 및 계정
4. 서비스 이용
5. 개인정보 보호
6. 책임의 제한
7. 기타 조항
`}
      </Typography>
    </Paper>
  );
};

export default TermsViewer;


