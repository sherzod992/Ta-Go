import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useChatSubscriptions } from '../../hooks/useChatSubscriptions';
import { GET_CHAT_MESSAGES, GET_CHAT_ROOMS } from '../../../apollo/user/query';
import { SEND_MESSAGE } from '../../../apollo/user/mutation';
import { ChatMessage, ChatRoom } from '../../types/chat/chat';
import { Box, TextField, Button, List, ListItem, Typography, Paper, Avatar } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

interface UnifiedChatProps {
  roomId?: string;
  propertyId?: string;
}

const UnifiedChat: React.FC<UnifiedChatProps> = ({ roomId, propertyId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채팅 메시지 조회
  const { data: messagesData, loading: messagesLoading, refetch: refetchMessages } = useQuery(GET_CHAT_MESSAGES, {
    variables: { input: { roomId: roomId || '', page: 1, limit: 50 } },
    skip: !roomId,
  });

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

  // 메시지 전송 뮤테이션
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      setNewMessage('');
      refetchMessages();
      refetchRooms();
    },
    onError: (error) => {
      console.error('메시지 전송 실패:', error);
    },
  });

  // GraphQL Subscription 사용
  const { onMessageSent, onChatRoomUpdated } = useChatSubscriptions({
    roomId,
    onMessageSent: (message: ChatMessage) => {
      console.log('새 메시지 수신:', message);
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    },
    onChatRoomUpdated: (room: ChatRoom) => {
      console.log('채팅방 업데이트:', room);
      setChatRooms(prev => 
        prev.map(r => r._id === room._id ? room : r)
      );
    },
  });

  // 메시지 데이터 처리
  useEffect(() => {
    if (messagesData?.getChatMessages?.list) {
      setMessages(messagesData.getChatMessages.list);
    }
  }, [messagesData]);

  // 채팅방 데이터 처리
  useEffect(() => {
    if (roomsData?.getChatRooms?.list) {
      setChatRooms(roomsData.getChatRooms.list);
    }
  }, [roomsData]);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !roomId) return;

    try {
      await sendMessage({
        variables: {
          input: {
            roomId,
            content: newMessage.trim(),
            messageType: 'TEXT',
          },
        },
      });
    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
    }
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (messagesLoading || roomsLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Box sx={{ display: 'flex', height: '600px', border: '1px solid #ddd' }}>
      {/* 채팅방 목록 */}
      <Box sx={{ width: '300px', borderRight: '1px solid #ddd', overflow: 'auto' }}>
        <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #ddd' }}>
          채팅방 목록
        </Typography>
        <List>
          {chatRooms.map((room) => (
            <ListItem key={room._id} button>
              <Box>
                <Typography variant="subtitle1">{room.propertyTitle}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {room.lastMessageContent || '메시지가 없습니다'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {room.unreadCountForUser > 0 && `읽지 않은 메시지: ${room.unreadCountForUser}`}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* 채팅 메시지 영역 */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 메시지 목록 */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.map((message) => (
            <Box
              key={message._id}
              sx={{
                display: 'flex',
                justifyContent: message.isAgent ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Paper
                sx={{
                  p: 1,
                  maxWidth: '70%',
                  backgroundColor: message.isAgent ? '#e3f2fd' : '#f5f5f5',
                }}
              >
                <Typography variant="body2">{message.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {/* 메시지 입력 */}
        <Box sx={{ p: 2, borderTop: '1px solid #ddd' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="메시지를 입력하세요..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              endIcon={<SendIcon />}
            >
              전송
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UnifiedChat;
