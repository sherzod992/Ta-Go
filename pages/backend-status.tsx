import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Button, Alert } from '@mui/material';
import { CheckCircle, Error, Warning, Refresh } from '@mui/icons-material';

interface BackendStatus {
  status: string;
  backend: string;
  data?: any;
  error?: string;
  backendUrl?: string;
  statusCode?: number;
}

export default function BackendStatus() {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkBackendStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-backend');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        status: 'error',
        backend: 'disconnected',
        error: 'Failed to check backend status'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const getStatusIcon = () => {
    if (!status) return <Warning color="warning" />;
    
    switch (status.backend) {
      case 'connected':
        return <CheckCircle color="success" />;
      case 'connected_but_error':
        return <Warning color="warning" />;
      case 'disconnected':
        return <Error color="error" />;
      default:
        return <Warning color="warning" />;
    }
  };

  const getStatusColor = () => {
    if (!status) return 'warning';
    
    switch (status.backend) {
      case 'connected':
        return 'success';
      case 'connected_but_error':
        return 'warning';
      case 'disconnected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusText = () => {
    if (!status) return '확인 중...';
    
    switch (status.backend) {
      case 'connected':
        return '백엔드 연결됨';
      case 'connected_but_error':
        return `백엔드 연결됨 (오류: ${status.statusCode})`;
      case 'disconnected':
        return '백엔드 연결 끊어짐';
      default:
        return '상태 불명';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        백엔드 서버 상태 확인
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {getStatusIcon()}
            <Typography variant="h6" sx={{ ml: 1 }}>
              현재 상태
            </Typography>
          </Box>
          
          <Chip 
            label={getStatusText()}
            color={getStatusColor() as any}
            sx={{ mb: 2 }}
          />
          
          {status?.backendUrl && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              백엔드 URL: {status.backendUrl}
            </Typography>
          )}
          
          {status?.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              오류: {status.error}
            </Alert>
          )}
          
          {status?.data && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                백엔드 응답 데이터:
              </Typography>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {JSON.stringify(status.data, null, 2)}
              </pre>
            </Box>
          )}
          
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={checkBackendStatus}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? '확인 중...' : '상태 새로고침'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            문제 해결 방법
          </Typography>
          <Typography variant="body2" paragraph>
            1. 서버에 SSH 접속하여 백엔드 서비스 상태 확인
          </Typography>
          <Typography variant="body2" paragraph>
            2. 환경 변수 파일(.env) 확인 및 수정
          </Typography>
          <Typography variant="body2" paragraph>
            3. MongoDB 연결 설정 확인
          </Typography>
          <Typography variant="body2" paragraph>
            4. PM2 프로세스 재시작
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
