import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReactiveVar } from '@apollo/client';
import { useGlobalChat } from '../../hooks/useGlobalChat';
import { ChatMessage } from '../../types/chat/chat';
import { userVar } from '../../../apollo/store';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Avatar,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface PropertyChatProps {
  propertyId: string;
  propertyTitle: string;
  onClose: () => void;
  isMobile: boolean;
  onChatRoomCreated?: (roomId: string) => void; // 채팅방 생성 콜백 추가
  onMessageSent?: (message: ChatMessage) => void; // 메시지 전송 콜백 추가
}

const PropertyChat: React.FC<PropertyChatProps> = ({
  propertyId,
  propertyTitle,
  onClose,
  isMobile,
  onChatRoomCreated,
  onMessageSent
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const user = useReactiveVar(userVar);
  
  const [newMessage, setNewMessage] = useState('');
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 전역 채팅 훅 사용 (채팅방 ID가 있을 때만)
  const {
    messages,
    loading,
    errors,
    sendMessage,
    createChatRoom,
    markAsRead,
    sendTypingStatus,
    chatRooms,
  } = useGlobalChat(chatRoomId || undefined);

  // 채팅방 생성 또는 기존 채팅방 찾기
  useEffect(() => {
    const initializeChat = async () => {
      // 사용자가 로그인하지 않은 경우 채팅방 생성하지 않음
      if (!user?._id) {
        console.log('사용자가 로그인하지 않음');
        return;
      }

      // 이미 채팅방이 생성된 경우 중복 생성 방지
      if (chatRoomId) {
        console.log('이미 채팅방 ID가 설정됨:', chatRoomId);
        return;
      }

      console.log('채팅방 초기화 시작:', { propertyId, chatRoomsCount: chatRooms.length });

      // 기존 채팅방이 있는지 확인
      const existingRoom = chatRooms.find(room => room.propertyId === propertyId);
      if (existingRoom) {
        setChatRoomId(existingRoom.roomId);
        console.log('기존 채팅방 발견:', existingRoom.roomId);
        return;
      }

      // 채팅방 목록이 로드되었지만 해당 매물의 채팅방이 없는 경우 새로 생성
      // 채팅방 목록이 로드되었으면 (빈 배열이어도) 새 채팅방 생성
      console.log('채팅방 목록 로드 완료, 새 채팅방 생성 시도');
      try {
        console.log('새 채팅방 생성 시작');
        await createChatRoom(propertyId);
        console.log('채팅방 생성 완료');
      } catch (error) {
        console.error('채팅방 생성 실패:', error);
      }
    };

    if (propertyId && !chatRoomId) {
      initializeChat();
    }
  }, [propertyId, user?._id, createChatRoom, chatRooms, chatRoomId]);

  // 메시지 데이터 처리
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // 새로 생성된 채팅방 ID 설정
  useEffect(() => {
    if (!chatRoomId && chatRooms.length > 0) {
      const newRoom = chatRooms.find(room => room.propertyId === propertyId);
      if (newRoom) {
        setChatRoomId(newRoom.roomId);
        console.log('새 채팅방 ID 설정:', newRoom.roomId);
      }
    }
  }, [chatRooms, propertyId, chatRoomId]);

  // 채팅방 목록이 변경될 때마다 해당 매물의 채팅방 확인
  useEffect(() => {
    if (chatRooms.length > 0 && propertyId) {
      const targetRoom = chatRooms.find(room => room.propertyId === propertyId);
      if (targetRoom && !chatRoomId) {
        setChatRoomId(targetRoom.roomId);
        console.log('채팅방 목록에서 채팅방 발견 및 ID 설정:', targetRoom.roomId);
      }
    }
  }, [chatRooms, propertyId, chatRoomId]);

  // 디버깅: 현재 상태 로그
  useEffect(() => {
    console.log('PropertyChat 상태:', {
      chatRoomId,
      propertyId,
      messagesCount: messages.length,
      loading: loading.messages,
      chatRoomsCount: chatRooms.length
    });
  }, [chatRoomId, propertyId, messages.length, loading.messages, chatRooms.length]);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatRoomId || loading.messages) return;

    const messageContent = newMessage.trim();
    
    try {
      // 전역 상태를 통해 메시지 전송
      await sendMessage(messageContent, 'TEXT');
      setNewMessage('');
      
      // 부모 컴포넌트에 메시지 전송 알림
      if (onMessageSent) {
        // 전역 상태에서 가장 최근 메시지를 찾아서 전달
        const latestMessage = messages[messages.length - 1];
        if (latestMessage) {
          onMessageSent(latestMessage);
        }
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 메시지 시간 포맷팅
  const formatMessageTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'HH:mm', { locale: ko });
    } catch {
      return '';
    }
  };

  // 현재 사용자 ID (실제로는 인증된 사용자 정보에서 가져와야 함)
  const currentUserId = 'current-user-id'; // 임시 값

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#f8f9fa'
    }}>
      {/* 채팅 헤더 */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 2,
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        minHeight: 64
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatIcon sx={{ color: '#667eea' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {propertyTitle}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* 메시지 영역 */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        {!user?._id ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: '#666',
            textAlign: 'center',
            p: 3
          }}>
            <ChatIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              로그인이 필요합니다
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
              채팅을 이용하려면 로그인해주세요
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => window.location.href = '/login'}
              sx={{ 
                backgroundColor: '#667eea',
                '&:hover': { backgroundColor: '#5a6fd8' }
              }}
            >
              로그인하기
            </Button>
          </Box>
        ) : loading.messages ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: '#666'
          }}>
            <ChatIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1" sx={{ mb: 1 }}>
              채팅을 시작해보세요
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              매물에 대한 문의사항을 자유롭게 물어보세요
            </Typography>
          </Box>
        ) : (
          messages.map((message) => {
            const isMyMessage = message.senderId === currentUserId;
            
            return (
              <Box
                key={message._id}
                sx={{
                  display: 'flex',
                  justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: '70%',
                  alignItems: isMyMessage ? 'flex-end' : 'flex-start'
                }}>
                  {/* 메시지 내용 */}
                  <Paper
                    elevation={1}
                    sx={{
                      padding: 1.5,
                      backgroundColor: isMyMessage ? '#667eea' : 'white',
                      color: isMyMessage ? 'white' : 'text.primary',
                      borderRadius: 2,
                      borderTopRightRadius: isMyMessage ? 0 : 2,
                      borderTopLeftRadius: isMyMessage ? 2 : 0,
                      wordBreak: 'break-word',
                      position: 'relative',
                      '&::before': isMyMessage ? {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: -8,
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid #667eea',
                        borderTop: '8px solid transparent'
                      } : {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: -8,
                        width: 0,
                        height: 0,
                        borderRight: '8px solid white',
                        borderTop: '8px solid transparent'
                      }
                    }}
                  >
                    <Typography variant="body2">
                      {message.content}
                    </Typography>
                  </Paper>
                  
                  {/* 메시지 시간 */}
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      color: '#666',
                      fontSize: '0.75rem'
                    }}
                  >
                    {formatMessageTime(message.createdAt)}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* 메시지 입력 영역 - 로그인한 사용자만 표시 */}
      {user?._id && (
        <Box sx={{
          padding: 2,
          backgroundColor: 'white',
          borderTop: '1px solid #e0e0e0'
        }}>
          <Box sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end'
          }}>
            <TextField
              ref={inputRef}
              fullWidth
              multiline
              maxRows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              variant="outlined"
              size="small"
              disabled={loading.messages}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading.messages}
              sx={{
                minWidth: 48,
                height: 40,
                backgroundColor: '#667eea',
                '&:hover': {
                  backgroundColor: '#5a6fd8'
                },
                '&:disabled': {
                  backgroundColor: '#ccc'
                }
              }}
            >
              {loading.messages ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon fontSize="small" />
              )}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PropertyChat;
