import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useGlobalChat } from '../../hooks/useGlobalChat';
import { ChatMessage } from '../../types/chat/chat';
import { ChatRoom as ChatRoomType } from '../../stores/chatStore';
import ChatRoomList from './ChatRoomList';
import ChatRoom from './ChatRoom';
import { useTranslation } from '../../hooks/useTranslation';
import {
  Box,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Chat as ChatIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
} from '@mui/icons-material';


interface UnifiedChatLayoutProps {
  initialRoomId?: string;
  propertyId?: string;
  onBack?: () => void;
}

const UnifiedChatLayout: React.FC<UnifiedChatLayoutProps> = ({
  initialRoomId,
  propertyId,
  onBack,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [showChatRoom, setShowChatRoom] = useState(false); // 모바일용

  // 전역 채팅 훅 사용
  const {
    chatRooms,
    onlineUsers,
    loading,
    errors,
    selectedRoomId,
    selectRoom,
    refetchRooms,
  } = useGlobalChat();

  // 초기 채팅방 선택 처리
  useEffect(() => {
    if (chatRooms.length > 0) {
      // 특정 매물 ID가 있고 해당 매물의 채팅방이 있으면 자동 선택
      if (propertyId && !selectedRoomId) {
        const propertyRoom = chatRooms.find(
          (room: ChatRoomType) => room.propertyId === propertyId
        );
        if (propertyRoom) {
          selectRoom(propertyRoom.roomId);
          if (isMobile) {
            setShowChatRoom(true);
          }
        }
      }
      
      // initialRoomId가 있으면 해당 방 선택
      if (initialRoomId && !selectedRoomId) {
        const targetRoom = chatRooms.find(
          (room: ChatRoomType) => room.roomId === initialRoomId
        );
        if (targetRoom) {
          selectRoom(initialRoomId);
          if (isMobile) {
            setShowChatRoom(true);
          }
        }
      }
    }
  }, [chatRooms, propertyId, initialRoomId, selectedRoomId, isMobile, selectRoom]);

  // 채팅방 선택 핸들러
  const handleRoomSelect = (roomId: string) => {
    selectRoom(roomId);
    if (isMobile) {
      setShowChatRoom(true);
    }
  };

  // 메시지 전송 후 처리
  const handleMessageSent = (message: ChatMessage) => {
    console.log('메시지 전송됨:', message);
    // 채팅방 목록 새로고침
    refetchRooms();
  };

  // 모바일에서 채팅 목록으로 돌아가기
  const handleBackToList = () => {
    setShowChatRoom(false);
    // selectRoom은 null을 받지 않으므로 선택 해제는 다른 방법으로 처리
  };

  // 홈페이지로 이동
  const handleGoHome = () => {
    console.log('홈 버튼 클릭됨');
    console.log('현재 경로:', router.asPath);
    console.log('현재 쿼리:', router.query);
    
    // 직접 window.location을 사용하여 강제 페이지 전환
    window.location.href = '/';
  };

  // 선택된 채팅방 정보
  const selectedRoom = chatRooms.find(room => room.roomId === selectedRoomId);

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {showChatRoom && selectedRoom ? (
          // 채팅방 화면
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 모바일 헤더 */}
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid #ddd', 
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <IconButton onClick={handleBackToList}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {selectedRoom.agentNickname || selectedRoom.userNickname || t('Unknown')}
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <ChatRoom
                selectedRoom={selectedRoom}
                onMessageSent={handleMessageSent}
              />
            </Box>
          </Box>
        ) : (
          // 채팅 목록 화면
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 헤더 */}
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid #ddd', 
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              {onBack && (
                <IconButton onClick={onBack}>
                  <ArrowBackIcon />
                </IconButton>
              )}
              <ChatIcon />
              <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                {t('Chat')}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => window.location.href = '/'}
                sx={{ cursor: 'pointer' }}
              >
                <HomeIcon />
              </IconButton>
              {chatRooms.filter(room => room.unreadCountForUser > 0).length > 0 && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    bgcolor: '#FF9500', 
                    color: 'white', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1
                  }}
                >
                  {t('{{count}} new messages', { count: chatRooms.reduce((sum, room) => sum + room.unreadCountForUser, 0) })}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <ChatRoomList
                chatRooms={chatRooms}
                selectedRoomId={selectedRoomId}
                onRoomSelect={handleRoomSelect}
                onlineUsers={onlineUsers}
                loading={loading.rooms}
              />
            </Box>
          </Box>
        )}
      </Paper>
    );
  }

  // 데스크톱 레이아웃
  return (
    <Paper sx={{ 
      height: '100%', 
      display: 'flex',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: 3
    }}>
      {/* 왼쪽: 채팅 목록 */}
      <Box sx={{ 
        width: '320px', 
        borderRight: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 헤더 */}
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #ddd', 
          bgcolor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          {onBack && (
            <IconButton onClick={onBack} size="small">
              <ArrowBackIcon />
            </IconButton>
          )}
          <ChatIcon sx={{ color: '#FF9500' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
            {t('Chat')}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => window.location.href = '/'}
            sx={{ cursor: 'pointer' }}
          >
            <HomeIcon />
          </IconButton>
          {chatRooms.filter(room => room.unreadCountForUser > 0).length > 0 && (
            <Typography 
              variant="caption" 
              sx={{ 
                bgcolor: '#FF9500', 
                color: 'white', 
                px: 1, 
                py: 0.5, 
                borderRadius: 1,
                fontSize: '0.7rem'
              }}
            >
              {chatRooms.reduce((sum, room) => sum + room.unreadCountForUser, 0)}
            </Typography>
          )}
        </Box>
        
        {/* 채팅방 목록 */}
        <Box sx={{ flex: 1 }}>
          <ChatRoomList
            chatRooms={chatRooms}
            selectedRoomId={selectedRoomId}
            onRoomSelect={handleRoomSelect}
            onlineUsers={onlineUsers}
                            loading={loading.rooms}
          />
        </Box>
      </Box>

      {/* 오른쪽: 채팅방 */}
      <Box sx={{ flex: 1 }}>
        <ChatRoom
          selectedRoom={selectedRoom || null}
          onMessageSent={handleMessageSent}
        />
      </Box>
    </Paper>
  );
};

export default UnifiedChatLayout;
