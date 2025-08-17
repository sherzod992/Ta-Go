import React from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useChatNotifications } from '../../hooks/useChatNotifications';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Chip,
  Alert,
  AlertTitle,
  Divider
} from '@mui/material';
import { 
  Wifi, 
  WifiOff, 
  Refresh,
  Notifications,
  NotificationsOff
} from '@mui/icons-material';

const WebSocketTest: React.FC = () => {
  const user = useReactiveVar(userVar);
  
  const {
    isConnected,
    currentRoom,
    typingUsers,
    joinRoom,
    leaveRoom,
    sendTypingStatus,
    markAsRead,
    reconnect,
    socket,
  } = useWebSocket({
    onMessage: (message) => {
      console.log('📨 테스트 - 새 메시지 수신:', message);
    },
    onTyping: (data) => {
      console.log('⌨️ 테스트 - 타이핑 상태 수신:', data);
    },
    onNotification: (notification) => {
      console.log('🔔 테스트 - 새 알림 수신:', notification);
    },
  });

  const { requestNotificationPermission } = useChatNotifications({
    userId: user?._id || '',
    onNotification: (notification) => {
      console.log('🔔 테스트 - 채팅 알림 수신:', notification);
    },
  });

  const handleTestJoinRoom = () => {
    joinRoom('test-room-123');
  };

  const handleTestLeaveRoom = () => {
    leaveRoom('test-room-123');
  };

  const handleTestTyping = () => {
    sendTypingStatus('test-room-123', true);
    setTimeout(() => {
      sendTypingStatus('test-room-123', false);
    }, 3000);
  };

  const handleTestMarkAsRead = () => {
    markAsRead('test-room-123', ['test-message-1', 'test-message-2']);
  };

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      // 테스트 알림 표시
      new Notification('테스트 알림', {
        body: 'WebSocket 연결이 정상적으로 작동하고 있습니다!',
        icon: '/favicon.ico',
      });
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        🔌 WebSocket 연결 테스트
      </Typography>
      
      <Divider sx={{ my: 2 }} />

      {/* 연결 상태 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          연결 상태
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {isConnected ? (
            <Chip 
              icon={<Wifi />} 
              label="연결됨" 
              color="success" 
              variant="outlined"
            />
          ) : (
            <Chip 
              icon={<WifiOff />} 
              label="연결 끊어짐" 
              color="error" 
              variant="outlined"
            />
          )}
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={reconnect}
            disabled={isConnected}
            size="small"
          >
            재연결
          </Button>
        </Box>
        
        <Alert severity={isConnected ? "success" : "error"}>
          <AlertTitle>
            {isConnected ? "WebSocket 연결됨" : "WebSocket 연결 끊어짐"}
          </AlertTitle>
          {isConnected 
            ? "실시간 메시지 송수신이 가능합니다."
            : "연결을 복구하기 위해 재연결 버튼을 클릭하세요."
          }
        </Alert>
      </Box>

      {/* 현재 방 정보 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          현재 방 정보
        </Typography>
        <Typography variant="body2" color="text.secondary">
          현재 방: {currentRoom || '참가된 방 없음'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          타이핑 중인 사용자: {typingUsers.length}명
        </Typography>
      </Box>

      {/* 테스트 버튼들 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          기능 테스트
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleTestJoinRoom}
            disabled={!isConnected}
            size="small"
          >
            방 참가 테스트
          </Button>
          <Button
            variant="contained"
            onClick={handleTestLeaveRoom}
            disabled={!isConnected || !currentRoom}
            size="small"
          >
            방 나가기 테스트
          </Button>
          <Button
            variant="contained"
            onClick={handleTestTyping}
            disabled={!isConnected}
            size="small"
          >
            타이핑 테스트
          </Button>
          <Button
            variant="contained"
            onClick={handleTestMarkAsRead}
            disabled={!isConnected}
            size="small"
          >
            읽음 처리 테스트
          </Button>
        </Box>
      </Box>

      {/* 알림 테스트 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          알림 테스트
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Notifications />}
          onClick={handleTestNotification}
          size="small"
        >
          브라우저 알림 테스트
        </Button>
      </Box>

      {/* 디버그 정보 */}
      <Box>
        <Typography variant="h6" gutterBottom>
          디버그 정보
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          Socket ID: {socket?.id || 'N/A'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          연결 상태: {socket?.connected ? 'true' : 'false'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          환경 변수: {process.env.NEXT_PUBLIC_API_WS || 'N/A'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default WebSocketTest;
