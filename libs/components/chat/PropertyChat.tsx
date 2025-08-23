import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_CHAT_ROOM, SEND_MESSAGE } from '../../../apollo/user/mutation';
import { GET_CHAT_MESSAGES } from '../../../apollo/user/query';
import { useChatSubscriptions } from '../../hooks/useChatSubscriptions';
import { ChatMessage } from '../../types/chat/chat';
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
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 채팅방 생성 mutation
  const [createChatRoom] = useMutation(CREATE_CHAT_ROOM);
  
  // 메시지 전송 mutation
  const [sendMessage] = useMutation(SEND_MESSAGE);

  // 채팅방 메시지 조회
  const { data: messagesData, loading: messagesLoading, refetch: refetchMessages } = useQuery(GET_CHAT_MESSAGES, {
    variables: { 
      input: { 
        roomId: chatRoomId,
        page: 1, 
        limit: 100 
      } 
    },
    skip: !chatRoomId,
  });

  // GraphQL Subscription 사용
  const { onMessageSent: onSubscriptionMessageSent } = useChatSubscriptions({
    onMessageSent: (message: ChatMessage) => {
      if (message.roomId === chatRoomId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
        
        // 부모 컴포넌트에 메시지 전송 알림
        onMessageSent?.(message);
      }
    },
  });

  // 채팅방 생성 또는 기존 채팅방 찾기
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);
      try {
        // 기존 채팅방이 있는지 확인하고, 없으면 새로 생성
        const result = await createChatRoom({
          variables: {
            input: {
              roomType: 'PROPERTY_INQUIRY',
              propertyId: propertyId
            }
          }
        });
        
        const roomId = result.data?.createChatRoom?._id;
        if (roomId) {
          setChatRoomId(roomId);
          
          // 부모 컴포넌트에 채팅방 생성 알림
          onChatRoomCreated?.(roomId);
          
          console.log('채팅방 생성 완료:', roomId);
        }
      } catch (error) {
        console.error('채팅방 생성 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      initializeChat();
    }
  }, [propertyId, createChatRoom, onChatRoomCreated]);

  // 메시지 데이터 처리
  useEffect(() => {
    if (messagesData?.getChatMessages?.list) {
      const chatMessages = messagesData.getChatMessages.list;
      setMessages(chatMessages);
      scrollToBottom();
    }
  }, [messagesData]);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatRoomId || sending) return;

    setSending(true);
    try {
      const result = await sendMessage({
        variables: {
          input: {
            roomId: chatRoomId,
            content: newMessage.trim(),
            messageType: 'TEXT'
          }
        }
      });
      
      const sentMessage = result.data?.sendMessage;
      if (sentMessage) {
        // 부모 컴포넌트에 메시지 전송 알림
        onMessageSent?.(sentMessage);
      }
      
      setNewMessage('');
      refetchMessages();
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    } finally {
      setSending(false);
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
        {loading ? (
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

      {/* 메시지 입력 영역 */}
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
            disabled={sending}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
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
            {sending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon fontSize="small" />
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PropertyChat;
