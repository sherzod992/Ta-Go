import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useChatSubscriptions } from '../../hooks/useChatSubscriptions';
import { GET_CHAT_ROOMS } from '../../../apollo/user/query';
import { ChatRoom, ChatMessage } from '../../types/chat/chat';
import PropertyChat from './PropertyChat';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import {
  Box,
  List,
  ListItem,
  Typography,
  Paper,
  Avatar,
  Badge,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';

interface ChatManagerProps {
  propertyId?: string;
  propertyTitle?: string;
  propertyImage?: string;
  onBack?: () => void;
}

const ChatManager: React.FC<ChatManagerProps> = ({
  propertyId,
  propertyTitle,
  propertyImage,
  onBack,
}) => {
  const { isMobile } = useDeviceDetect();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // 채팅방 목록 조회
  const { data: roomsData, loading: roomsLoading, refetch: refetchRooms } = useQuery(GET_CHAT_ROOMS, {
    variables: { 
      input: { 
        page: 1, 
        limit: 20,
        status: 'ACTIVE',
        roomType: 'PROPERTY_INQUIRY'
      } 
    },
  });

  // GraphQL Subscription 사용
  const { onChatRoomUpdated, onUserOnlineStatus } = useChatSubscriptions({
    onChatRoomUpdated: (room: ChatRoom) => {
      console.log('채팅방 업데이트:', room);
      setChatRooms(prev => {
        const existingIndex = prev.findIndex(r => r._id === room._id);
        if (existingIndex >= 0) {
          // 기존 채팅방 업데이트
          const updated = [...prev];
          updated[existingIndex] = room;
          // 최신 메시지가 있는 채팅방을 맨 위로 이동
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
  });

  // 채팅방 데이터 처리
  useEffect(() => {
    if (roomsData?.getMyChatRooms?.list) {
      setChatRooms(roomsData.getMyChatRooms.list);
      
      // propertyId가 있고 해당 매물의 채팅방이 있으면 자동 선택
      if (propertyId && !selectedRoomId) {
        const propertyRoom = roomsData.getMyChatRooms.list.find(
          (room: ChatRoom) => room.propertyId === propertyId
        );
        if (propertyRoom) {
          setSelectedRoomId(propertyRoom.roomId);
        }
      }
    }
  }, [roomsData, propertyId, selectedRoomId]);

  // 메시지 전송 후 채팅방 목록 업데이트
  const handleMessageSent = (message: ChatMessage) => {
    console.log('메시지 전송됨:', message);
    // 채팅방 목록 새로고침
    refetchRooms();
  };

  // 채팅방 선택
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  // 채팅 목록으로 돌아가기
  const handleBackToList = () => {
    setSelectedRoomId(null);
  };

  // 선택된 채팅방 정보
  const selectedRoom = chatRooms.find(room => room.roomId === selectedRoomId);

  if (roomsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  // 매물 채팅 모드 (채팅방이 선택된 경우)
  if (selectedRoomId && selectedRoom) {
    return (
      <PropertyChat
        propertyId={selectedRoom.propertyId}
        propertyTitle={selectedRoom.propertyTitle}
        onClose={handleBackToList}
        isMobile={isMobile}
      />
    );
  }

  // 채팅 목록 모드
  return (
    <Box sx={{ 
      height: '600px', 
      display: 'flex', 
      flexDirection: 'column',
      border: '1px solid #ddd',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      {/* 헤더 */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid #ddd', 
        bgcolor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <ChatIcon />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          채팅 목록
        </Typography>
        {onBack && (
          <Button
            onClick={onBack}
            variant="text"
            size="small"
            sx={{ ml: 'auto' }}
          >
            닫기
          </Button>
        )}
      </Box>

      {/* 채팅방 목록 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {chatRooms.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column" gap={2}>
            <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
            <Typography color="text.secondary" textAlign="center">
              아직 채팅방이 없습니다.
              {propertyId && (
                <>
                  <br />
                  이 매물에 대해 문의해보세요!
                </>
              )}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {chatRooms.map((room, index) => (
              <React.Fragment key={room._id}>
                <ListItem 
                  button 
                  onClick={() => handleRoomSelect(room.roomId)}
                  sx={{ 
                    p: 2,
                    '&:hover': { bgcolor: '#f0f0f0' }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {room.propertyTitle}
                      </Typography>
                      {room.unreadCountForUser > 0 && (
                        <Badge badgeContent={room.unreadCountForUser} color="error" />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {room.lastMessageContent || '메시지가 없습니다'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {room.userNickname}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {onlineUsers.has(room.userId) && (
                          <CircleIcon sx={{ fontSize: 12, color: 'green' }} />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {room.lastMessageTime ? new Date(room.lastMessageTime).toLocaleTimeString() : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
                {index < chatRooms.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default ChatManager;
