import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_CHAT_MESSAGES, GET_PROPERTY } from '../../../apollo/user/query';
import { SEND_MESSAGE, MARK_AS_READ } from '../../../apollo/user/mutation';
import { ChatMessage, ChatRoom } from '../../types/chat/chat';
import { SendMessageInput } from '../../types/chat/chat.input';
import { useChatManager } from '../../hooks/useChatManager';
import { useChatSubscriptions } from '../../hooks/useChatSubscriptions';
import { useWebSocket } from '../../hooks/useWebSocket';
import { sweetErrorAlert } from '../../sweetAlert';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Paper,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from '@mui/material';
import {
  Send,
  ArrowBack,
  MoreVert,
  AttachFile,
  Close,
} from '@mui/icons-material';

interface UnifiedChatProps {
  propertyId?: string;
  initialChatId?: string;
  onChatCreated?: (chatId: string) => void;
  onBack?: () => void;
  showHeader?: boolean;
  showPropertyInfo?: boolean;
}

const UnifiedChat: React.FC<UnifiedChatProps> = ({
  propertyId,
  initialChatId,
  onChatCreated,
  onBack,
  showHeader = true,
  showPropertyInfo = true,
}) => {
  const router = useRouter();
  const { isMobile } = useDeviceDetect();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPropertyDialog, setShowPropertyDialog] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  // 채팅 관리자 훅 사용
  const {
    chatRooms,
    currentChatId,
    findOrCreateChatRoom,
    selectChatRoom,
    getChatRoomById,
    getChatRoomByPropertyId,
    isLoading: chatManagerLoading,
  } = useChatManager();

  // WebSocket 연결 및 실시간 기능
  const {
    isConnected: wsConnected,
    joinRoom,
    leaveRoom,
    sendTypingStatus,
    markAsRead: wsMarkAsRead,
    typingUsers: wsTypingUsers,
  } = useWebSocket({
    onMessage: (message) => {
      console.log('WebSocket 새 메시지 수신:', message);
      if (message.roomId === currentChatId) {
        const processedMessage = {
          ...message,
          isAgent: message.isAgent ?? false,
          isEdited: message.isEdited ?? false,
          isDeleted: message.isDeleted ?? false,
          isPinned: message.isPinned ?? false,
          isSystem: message.isSystem ?? false
        };
        setMessages(prev => [...prev, processedMessage]);
      }
    },
    onTyping: (data) => {
      console.log('WebSocket 타이핑 상태 수신:', data);
      if (data.roomId === currentChatId) {
        // 타이핑 상태 처리
      }
    },
    onNotification: (notification) => {
      console.log('WebSocket 새 알림 수신:', notification);
    },
  });

  // GraphQL Subscription
  const { messageSentData } = useChatSubscriptions({
    roomId: currentChatId || undefined,
    onMessageSent: (message) => {
      console.log('GraphQL Subscription 새 메시지 수신:', message);
      if (message.roomId === currentChatId) {
        const processedMessage = {
          ...message,
          isAgent: message.isAgent ?? false,
          isEdited: message.isEdited ?? false,
          isDeleted: message.isDeleted ?? false,
          isPinned: message.isPinned ?? false,
          isSystem: message.isSystem ?? false
        };
        setMessages(prev => [...prev, processedMessage]);
      }
    },
    onTypingIndicator: (data) => {
      console.log('GraphQL Subscription 타이핑 상태 수신:', data);
    },
    onChatNotification: (notification) => {
      console.log('GraphQL Subscription 채팅 알림 수신:', notification);
    },
  });

  // 매물 정보 조회
  const { data: propertyData, loading: loadingProperty } = useQuery(GET_PROPERTY, {
    variables: { input: propertyId as string },
    skip: !propertyId,
    onError: (error) => {
      console.error('매물 정보 조회 에러:', error);
      sweetErrorAlert('매물 정보를 불러오는데 실패했습니다.');
    },
    onCompleted: (data) => {
      if (data?.getProperty && userId) {
        const isPropertyOwner = data.getProperty.memberId === userId;
        setIsOwner(isPropertyOwner);
        
        if (isPropertyOwner) {
          sweetErrorAlert('자신이 올린 매물에는 채팅할 수 없습니다.');
          if (onBack) onBack();
        }
      }
    }
  });

  // 메시지 조회
  const { data: messagesData, loading: loadingMessages, error: messagesError, refetch: refetchMessages } = useQuery(GET_CHAT_MESSAGES, {
    variables: { 
      input: { 
        roomId: currentChatId || '', 
        page: 1, 
        limit: 50 
      } 
    },
    skip: !currentChatId,
    pollInterval: 3000,
    notifyOnNetworkStatusChange: false,
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error('메시지 조회 에러:', error);
      if (error.message.includes('채팅방을 찾을 수 없습니다') || 
          error.message.includes('not found') ||
          error.message.includes('Chat room not found')) {
        console.log('채팅방이 존재하지 않습니다. 새로 생성합니다.');
        if (propertyId) {
          handleCreateNewChatRoom();
        }
      }
    }
  });

  // 메시지 전송
  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
    onCompleted: (data) => {
      console.log('메시지 전송 성공:', data);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('메시지 전송 에러:', error);
      sweetErrorAlert('메시지 전송에 실패했습니다.');
      setIsTyping(false);
    }
  });

  // 메시지 읽음 처리
  const [markAsRead] = useMutation(MARK_AS_READ, {
    onError: (error) => {
      console.error('메시지 읽음 처리 에러:', error);
    }
  });

  // 채팅방 초기화
  useEffect(() => {
    const initializeChat = async () => {
      if (!propertyId && !initialChatId) {
        setIsInitializing(false);
        return;
      }

      try {
        if (initialChatId) {
          // 기존 채팅방 ID로 선택
          selectChatRoom(initialChatId);
          setIsInitializing(false);
          return;
        }

        if (propertyId) {
          // 매물 ID로 채팅방 찾기 또는 생성
          const chatRoom = await findOrCreateChatRoom(propertyId);
          if (chatRoom) {
            const chatId = chatRoom.roomId || chatRoom._id;
            selectChatRoom(chatId);
            onChatCreated?.(chatId);
          }
        }
      } catch (error) {
        console.error('채팅 초기화 에러:', error);
        sweetErrorAlert('채팅 초기화에 실패했습니다.');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [propertyId, initialChatId, findOrCreateChatRoom, selectChatRoom, onChatCreated]);

  // 채팅방 변경 시 WebSocket 연결
  useEffect(() => {
    if (currentChatId) {
      // 이전 채팅방에서 나가기
      if (messages.length > 0) {
        leaveRoom(messages[0].roomId);
      }
      
      // 새 채팅방 참가
      joinRoom(currentChatId);
    }
  }, [currentChatId, joinRoom, leaveRoom]);

  // 메시지 업데이트
  useEffect(() => {
    if (messagesData?.getChatMessages?.list) {
      const processedMessages = messagesData.getChatMessages.list.map((message: any) => ({
        ...message,
        senderId: String(message.senderId),
        senderNickname: message.senderNickname || '알 수 없음'
      }));
      
      setMessages(prevMessages => {
        if (prevMessages.length === processedMessages.length) {
          const hasChanges = processedMessages.some((newMsg, index) => {
            const oldMsg = prevMessages[index];
            return oldMsg._id !== newMsg._id || oldMsg.content !== newMsg.content;
          });
          
          if (!hasChanges) {
            return prevMessages;
          }
        }
        
        const existingIds = new Set(prevMessages.map(msg => msg._id));
        const newMessages = processedMessages.filter(msg => !existingIds.has(msg._id));
        
        if (newMessages.length > 0) {
          return [...prevMessages, ...newMessages];
        }
        
        return processedMessages;
      });
    }
  }, [messagesData]);

  // 자동 스크롤
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  // 채팅방 진입 시 메시지 읽음 처리
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      markAsRead({
        variables: {
          input: {
            roomId: currentChatId
          }
        }
      });
    }
  }, [currentChatId, messages, markAsRead]);

  // 새로운 채팅방 생성 처리
  const handleCreateNewChatRoom = async () => {
    if (!propertyId || !userId) {
      console.error('매물 ID 또는 사용자 ID가 없습니다.');
      return;
    }

    try {
      const chatRoom = await findOrCreateChatRoom(propertyId);
      if (chatRoom) {
        const chatId = chatRoom.roomId || chatRoom._id;
        selectChatRoom(chatId);
        onChatCreated?.(chatId);
        
        // 초기 메시지 추가
        const initialMessage: ChatMessage = {
          _id: 'welcome',
          messageId: 'welcome',
          roomId: chatId,
          content: '안녕하세요! 이 매물에 대해 궁금한 점이 있으시면 언제든 말씀해 주세요.',
          senderId: 'system',
          messageType: 'SYSTEM',
          status: 'SENT',
          senderNickname: '시스템',
          isAgent: false,
          isEdited: false,
          isDeleted: false,
          isPinned: false,
          isSystem: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setMessages([initialMessage]);
      }
    } catch (error) {
      console.error('채팅방 생성 중 에러:', error);
      sweetErrorAlert('채팅방 생성에 실패했습니다.');
    }
  };

  // 메시지 전송
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || sendingMessage || !currentChatId || !userId) return;

    const currentMessage = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // 임시 메시지 생성
    const tempMessage: ChatMessage = {
      _id: `temp-${Date.now()}`,
      messageId: `temp-${Date.now()}`,
      roomId: currentChatId,
      content: currentMessage,
      senderId: String(userId),
      messageType: 'TEXT',
      status: 'SENDING',
      senderNickname: '나',
      isAgent: false,
      isEdited: false,
      isDeleted: false,
      isPinned: false,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const messageInput: SendMessageInput = {
        roomId: currentChatId,
        content: currentMessage
      };

      await sendMessage({
        variables: { input: messageInput }
      });

      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempMessage._id 
            ? { ...msg, status: 'SENT', _id: `sent-${Date.now()}` }
            : msg
        )
      );

    } catch (error) {
      console.error('메시지 전송 실패:', error);
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      sweetErrorAlert('메시지 전송에 실패했습니다.');
    } finally {
      setIsTyping(false);
    }
  }, [inputMessage, sendingMessage, currentChatId, userId, sendMessage]);

  // 입력창 자동 높이 조절
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }, []);

  // Enter 키로 메시지 전송
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const formatTime = useCallback((createdAt: string) => {
    return new Date(createdAt).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const formatDate = useCallback((createdAt: string) => {
    return new Date(createdAt).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const quickMessages = [
    '가격 협상 가능한가요?',
    '시승 가능한가요?',
    '사고 이력 있나요?',
    '현재 위치 어디인가요?',
    '추가 사진 보여주세요'
  ];

  const handleQuickMessage = useCallback((message: string) => {
    setInputMessage(message);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 매물 작성자인 경우 채팅 불가
  if (isOwner) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
        <Typography variant="h6" color="error" textAlign="center">
          자신이 올린 매물에는 채팅할 수 없습니다.
        </Typography>
        <Button 
          variant="contained" 
          onClick={onBack || (() => router.back())}
          sx={{ 
            background: 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF4500 100%)'
            }
          }}
        >
          돌아가기
        </Button>
      </Box>
    );
  }

  // 로딩 상태 처리
  if (isInitializing || chatManagerLoading || loadingProperty) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
        <CircularProgress sx={{ color: '#FF9500' }} />
        <Typography variant="h6" color="text.secondary">
          {isInitializing ? '채팅방을 초기화하는 중...' : '채팅 정보를 불러오는 중...'}
        </Typography>
      </Box>
    );
  }

  const currentChatRoom = getChatRoomById(currentChatId || '');

  return (
    <Box sx={{ 
      maxWidth: 800, 
      margin: '0 auto', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#f5f5f5'
    }}>
      {/* 헤더 */}
      {showHeader && (
        <Box sx={{ 
          background: 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)',
          color: 'white',
          p: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            {onBack && (
              <IconButton 
                onClick={onBack}
                sx={{ color: 'white' }}
              >
                <ArrowBack />
              </IconButton>
            )}
            
            <Box flex={1} onClick={() => setShowPropertyDialog(true)} sx={{ cursor: 'pointer' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                {propertyData?.getProperty?.propertyTitle || currentChatRoom?.propertyTitle || '매물 정보 로딩 중...'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                {currentChatRoom?.agentNickname || '담당자 미배정'}
              </Typography>
            </Box>

            <IconButton sx={{ color: 'white' }}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* 메시지 영역 */}
      <Box 
        flex={1} 
        overflow="auto" 
        p={2}
        sx={{ 
          background: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          justifyContent: 'flex-end'
        }}
      >
        {/* 매물 정보 카드 */}
        {showPropertyInfo && propertyData?.getProperty && (
          <Box sx={{ mb: 2 }}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              background: 'white'
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" gap={2}>
                  {propertyData.getProperty.propertyImages && propertyData.getProperty.propertyImages.length > 0 && (
                    <CardMedia
                      component="img"
                      image={propertyData.getProperty.propertyImages[0]}
                      alt={propertyData.getProperty.propertyTitle}
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: 1,
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem', mb: 0.5 }}>
                      {propertyData.getProperty.propertyTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {propertyData.getProperty.propertyBrand} {propertyData.getProperty.propertyModel}
                    </Typography>
                    <Typography variant="h6" color="#FF9500" fontWeight="bold">
                      {propertyData.getProperty.propertyPrice?.toLocaleString()}원
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {messages.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              채팅방을 초기화하는 중...
            </Typography>
          </Box>
        ) : (
          messages.map((message, index) => {
            const isUser = String(message.senderId) === String(userId);
            
            const showDate = index === 0 || 
              new Date(message.createdAt).toDateString() !== 
              new Date(messages[index - 1].createdAt).toDateString();

            return (
              <React.Fragment key={message._id}>
                {showDate && (
                  <Box textAlign="center" my={2}>
                    <Chip 
                      label={formatDate(message.createdAt)} 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        background: 'rgba(255,255,255,0.8)',
                        border: '1px solid #ddd'
                      }}
                    />
                  </Box>
                )}
                
                <Box 
                  display="flex" 
                  justifyContent={isUser ? 'flex-end' : 'flex-start'}
                  mb={1}
                  gap={1}
                >
                  {!isUser && (
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: '#FF9500',
                        fontSize: '0.8rem'
                      }}
                    >
                      {message.senderNickname?.charAt(0) || '담'}
                    </Avatar>
                  )}
                  
                  <Box
                    sx={{
                      maxWidth: '65%',
                      background: isUser ? 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)' : 'white',
                      color: isUser ? 'white' : '#333',
                      padding: '12px 16px',
                      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      position: 'relative',
                      wordBreak: 'break-word'
                    }}
                  >
                    <Typography variant="body1" sx={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
                      {message.content}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        opacity: 0.7,
                        display: 'block',
                        mt: 0.5,
                        fontSize: '0.75rem'
                      }}
                    >
                      {formatTime(message.createdAt)}
                      {message.status === 'READ' && isUser && ' ✓'}
                    </Typography>
                  </Box>
                </Box>
              </React.Fragment>
            );
          })
        )}
        
        {isTyping && (
          <Box display="flex" justifyContent="flex-start" mb={1} gap={1}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: '#FF9500',
                fontSize: '0.8rem'
              }}
            >
              담
            </Avatar>
            <Box
              sx={{
                background: 'white',
                padding: '12px 16px',
                borderRadius: '18px 18px 18px 4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                상대방이 입력 중...
              </Typography>
            </Box>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* 빠른 답변 */}
      <Box sx={{ 
        p: 1.5, 
        background: 'white', 
        borderTop: '1px solid #e0e0e0',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
      }}>
        <Box display="flex" gap={1} flexWrap="wrap">
          {quickMessages.map((message, index) => (
            <Button
              key={index}
              variant="outlined"
              size="small"
              onClick={() => handleQuickMessage(message)}
              disabled={sendingMessage}
              sx={{ 
                fontSize: '0.75rem',
                borderColor: '#FF9500',
                color: '#FF9500',
                '&:hover': {
                  borderColor: '#FF6B00',
                  background: 'rgba(255,149,0,0.1)'
                }
              }}
            >
              {message}
            </Button>
          ))}
        </Box>
      </Box>

      {/* 입력 영역 */}
      <Box sx={{ 
        p: 2, 
        background: 'white',
        borderTop: '1px solid #e0e0e0',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
      }}>
        <Box display="flex" gap={1} alignItems="flex-end">
          <IconButton 
            size="small"
            sx={{ 
              color: '#666',
              '&:hover': { color: '#FF9500' }
            }}
          >
            <AttachFile />
          </IconButton>
          
          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            variant="outlined"
            size="small"
            disabled={sendingMessage}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                '& fieldset': {
                  borderColor: '#ddd',
                },
                '&:hover fieldset': {
                  borderColor: '#FF9500',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FF9500',
                },
              }
            }}
          />
          
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sendingMessage}
            sx={{
              background: inputMessage.trim() ? 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)' : '#e0e0e0',
              color: 'white',
              '&:hover': {
                background: inputMessage.trim() ? 'linear-gradient(135deg, #FF6B00 0%, #FF4500 100%)' : '#e0e0e0',
              }
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default UnifiedChat;
