import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useChatSubscriptions } from '../../hooks/useChatSubscriptions';
import { GET_CHAT_ROOMS } from '../../../apollo/user/query';
import { ChatRoom as ChatRoomType, ChatMessage } from '../../types/chat/chat';
import ChatRoomList from './ChatRoomList';
import ChatRoom from './ChatRoom';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialRoomId || null);
  const [chatRooms, setChatRooms] = useState<ChatRoomType[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [showChatRoom, setShowChatRoom] = useState(false); // 모바일용

  // 채팅방 목록 조회
  const { data: roomsData, loading: roomsLoading, refetch: refetchRooms } = useQuery(GET_CHAT_ROOMS, {
    variables: { 
      input: { 
        page: 1, 
        limit: 50,
        status: 'ACTIVE',
        roomType: propertyId ? 'PROPERTY_INQUIRY' : undefined
      } 
    },
  });

  // GraphQL Subscription 사용
  const { onChatRoomUpdated, onUserOnlineStatus, onMessageSent } = useChatSubscriptions({
    onChatRoomUpdated: (room: ChatRoomType) => {
      console.log('채팅방 업데이트:', room);
      setChatRooms(prev => {
        const existingIndex = prev.findIndex(r => r._id === room._id);
        if (existingIndex >= 0) {
          // 기존 채팅방 업데이트 및 맨 위로 이동
          const updated = [...prev];
          updated[existingIndex] = room;
          return [room, ...updated.filter((_, index) => index !== existingIndex)];
        } else {
          // 새 채팅방 추가
          return [room, ...prev];
        }
      });
    },
    onUserOnlineStatus: (status: any) => {
      console.log('사용자 온라인 상태:', status);
      if (status.isOnline) {
        setOnlineUsers(prev => new Set(prev).add(status.userId));
      } else {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(status.userId);
          return newSet;
        });
      }
    },
    onMessageSent: (message: ChatMessage) => {
      console.log('새 메시지 수신:', message);
      // 채팅방 목록 새로고침 (새 메시지가 있는 방을 맨 위로 이동)
      refetchRooms();
    },
  });

  // 채팅방 데이터 처리
  useEffect(() => {
    if (roomsData?.getMyChatRooms?.list) {
      const rooms = roomsData.getMyChatRooms.list;
      
      // 최신순으로 정렬 (lastMessageTime 기준)
      const sortedRooms = [...rooms].sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });
      
      setChatRooms(sortedRooms);
      
      // 특정 매물 ID가 있고 해당 매물의 채팅방이 있으면 자동 선택
      if (propertyId && !selectedRoomId) {
        const propertyRoom = sortedRooms.find(
          (room: ChatRoomType) => room.propertyId === propertyId
        );
        if (propertyRoom) {
          setSelectedRoomId(propertyRoom.roomId);
          if (isMobile) {
            setShowChatRoom(true);
          }
        }
      }
      
      // initialRoomId가 있으면 해당 방 선택
      if (initialRoomId && !selectedRoomId) {
        const targetRoom = sortedRooms.find(
          (room: ChatRoomType) => room.roomId === initialRoomId
        );
        if (targetRoom) {
          setSelectedRoomId(initialRoomId);
          if (isMobile) {
            setShowChatRoom(true);
          }
        }
      }
    }
  }, [roomsData, propertyId, initialRoomId, selectedRoomId, isMobile]);

  // 채팅방 선택 핸들러
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
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
    setSelectedRoomId(null);
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
                {selectedRoom.agentNickname || selectedRoom.userNickname || '알 수 없음'}
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
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                채팅
              </Typography>
              {chatRooms.filter(room => room.unreadCountForUser > 0).length > 0 && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    bgcolor: '#FF9500', 
                    color: 'white', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1,
                    ml: 'auto'
                  }}
                >
                  {chatRooms.reduce((sum, room) => sum + room.unreadCountForUser, 0)}개의 새 메시지
                </Typography>
              )}
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <ChatRoomList
                chatRooms={chatRooms}
                selectedRoomId={selectedRoomId}
                onRoomSelect={handleRoomSelect}
                onlineUsers={onlineUsers}
                loading={roomsLoading}
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
            채팅
          </Typography>
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
            loading={roomsLoading}
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
