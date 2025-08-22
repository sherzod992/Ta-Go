import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useChatSubscriptions } from '../../hooks/useChatSubscriptions';
import { GET_CHAT_MESSAGES } from '../../../apollo/user/query';
import { SEND_MESSAGE } from '../../../apollo/user/mutation';
import { ChatMessage } from '../../types/chat/chat';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';

interface PropertyChatProps {
  propertyId: string;
  roomId?: string;
  propertyTitle?: string;
  propertyImage?: string;
  onBack?: () => void;
  onMessageSent?: (message: ChatMessage) => void;
}

interface MessageGroup {
  senderId: string;
  isAgent: boolean;
  messages: ChatMessage[];
  timestamp: Date;
}

const PropertyChat: React.FC<PropertyChatProps> = ({
  propertyId,
  roomId,
  propertyTitle,
  propertyImage,
  onBack,
  onMessageSent,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageGroups, setMessageGroups] = useState<MessageGroup[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // 채팅 메시지 조회
  const { data: messagesData, loading: messagesLoading, refetch: refetchMessages } = useQuery(GET_CHAT_MESSAGES, {
    variables: { input: { roomId: roomId || '', page: currentPage, limit: 20 } },
    skip: !roomId,
  });

  // 메시지 전송 뮤테이션
  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
    onCompleted: (data) => {
      setNewMessage('');
      refetchMessages();
      
      // 부모 컴포넌트에 메시지 전송 알림
      if (data?.sendMessage && onMessageSent) {
        onMessageSent(data.sendMessage);
      }
    },
    onError: (error) => {
      console.error('메시지 전송 실패:', error);
      setIsLoading(false);
    },
  });

  // GraphQL Subscription 사용
  const { onMessageSent: onSubscriptionMessageSent } = useChatSubscriptions({
    roomId,
    onMessageSent: (message: ChatMessage) => {
      console.log('새 메시지 수신:', message);
      setMessages(prev => [...prev, message]);
      setShouldAutoScroll(true);
      scrollToBottom();
    },
  });

  // 메시지를 그룹으로 묶는 함수
  const groupMessages = useCallback((messages: ChatMessage[]): MessageGroup[] => {
    if (!messages.length) return [];
    
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;
    
    // 시간 순서대로 정렬 (오래된 메시지부터)
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    sortedMessages.forEach((message) => {
      const messageTime = new Date(message.createdAt);
      
      // 새로운 그룹을 시작하는 조건
      if (!currentGroup || 
          currentGroup.senderId !== message.senderId ||
          messageTime.getTime() - currentGroup.timestamp.getTime() > 5 * 60 * 1000) { // 5분 이상 차이나면 새 그룹
        
        currentGroup = {
          senderId: message.senderId,
          isAgent: message.isAgent,
          messages: [message],
          timestamp: messageTime,
        };
        groups.push(currentGroup);
      } else {
        // 기존 그룹에 메시지 추가
        currentGroup.messages.push(message);
      }
    });
    
    return groups;
  }, []);

  // 메시지 데이터 처리
  useEffect(() => {
    if (messagesData?.getChatMessages?.list) {
      const newMessages = messagesData.getChatMessages.list;
      
      if (currentPage === 1) {
        // 첫 페이지 로드
        setMessages(newMessages);
        setHasMoreMessages(newMessages.length === 20);
      } else {
        // 추가 페이지 로드 (기존 메시지 앞에 추가)
        setMessages(prev => [...newMessages, ...prev]);
        setHasMoreMessages(newMessages.length === 20);
      }
    }
  }, [messagesData, currentPage]);

  // 메시지 그룹 업데이트
  useEffect(() => {
    setMessageGroups(groupMessages(messages));
  }, [messages, groupMessages]);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 스크롤 위치 감지
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShouldAutoScroll(isNearBottom);
    
    // 맨 위에 도달했을 때 과거 메시지 로드
    if (scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMore]);

  // 과거 메시지 로드
  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMoreMessages) return;
    
    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messageGroups, shouldAutoScroll]);

  // 메시지 전송 핸들러
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !roomId || sendingMessage) return;

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (messagesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

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
        gap: 2
      }}>
        {onBack && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="text"
            size="small"
          >
            뒤로
          </Button>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          {propertyImage && (
            <Avatar 
              src={propertyImage} 
              sx={{ width: 32, height: 32 }}
            />
          )}
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {propertyTitle || '매물 문의'}
          </Typography>
        </Box>
      </Box>

      {/* 메시지 목록 */}
      <Box 
        ref={messagesContainerRef}
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          bgcolor: '#fafafa',
          position: 'relative'
        }}
        onScroll={handleScroll}
      >
        {/* 과거 메시지 로딩 표시 */}
        {isLoadingMore && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <CircularProgress size={20} />
          </Box>
        )}
        
        {messageGroups.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="text.secondary">
              아직 메시지가 없습니다. 첫 메시지를 보내보세요!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messageGroups.map((group, groupIndex) => (
              <Box
                key={`${group.senderId}-${group.timestamp.getTime()}`}
                sx={{
                  display: 'flex',
                  justifyContent: group.isAgent ? 'flex-start' : 'flex-end',
                  flexDirection: 'column',
                }}
              >
                {/* 시간 표시 */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 1,
                  mx: 'auto'
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      bgcolor: 'rgba(0,0,0,0.1)', 
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      color: 'text.secondary'
                    }}
                  >
                    {group.timestamp.toLocaleDateString()} {group.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
                
                {/* 메시지 그룹 */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  gap: 1, 
                  maxWidth: '70%',
                  alignSelf: group.isAgent ? 'flex-start' : 'flex-end',
                  flexDirection: group.isAgent ? 'row' : 'row-reverse'
                }}>
                  {/* 아바타 (첫 번째 메시지에만 표시) */}
                  {group.isAgent && (
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: '#4caf50', 
                      fontSize: '0.8rem',
                      alignSelf: 'flex-end',
                      mb: 0.5
                    }}>
                      A
                    </Avatar>
                  )}
                  
                  {/* 메시지들 */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 0.5,
                    alignItems: group.isAgent ? 'flex-start' : 'flex-end'
                  }}>
                    {group.messages.map((message, messageIndex) => (
                      <Paper
                        key={message._id}
                        sx={{
                          p: 1.5,
                          backgroundColor: group.isAgent ? '#e3f2fd' : '#FF9500',
                          color: group.isAgent ? '#333' : 'white',
                          boxShadow: 1,
                          maxWidth: '100%',
                          // 연속된 메시지 스타일링
                          borderRadius: messageIndex === 0 ? 2 : 
                                       messageIndex === group.messages.length - 1 ? 2 : 1,
                          borderTopLeftRadius: group.isAgent && messageIndex > 0 ? 4 : undefined,
                          borderTopRightRadius: !group.isAgent && messageIndex > 0 ? 4 : undefined,
                          borderBottomLeftRadius: group.isAgent && messageIndex < group.messages.length - 1 ? 4 : undefined,
                          borderBottomRightRadius: !group.isAgent && messageIndex < group.messages.length - 1 ? 4 : undefined,
                        }}
                      >
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                          {message.content}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                  
                  {/* 아바타 (첫 번째 메시지에만 표시) */}
                  {!group.isAgent && (
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: '#FF9500', 
                      fontSize: '0.8rem',
                      alignSelf: 'flex-end',
                      mb: 0.5
                    }}>
                      나
                    </Avatar>
                  )}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* 메시지 입력 */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid #ddd', 
        bgcolor: 'white',
        display: 'flex',
        gap: 1,
        alignItems: 'flex-end'
      }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="메시지를 입력하세요..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          size="small"
          disabled={sendingMessage || isLoading}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sendingMessage || isLoading}
          endIcon={<SendIcon />}
          sx={{
            bgcolor: '#FF9500',
            '&:hover': { bgcolor: '#FF6B00' },
            minWidth: '80px'
          }}
        >
          전송
        </Button>
      </Box>

      {/* 로딩 상태 표시 */}
      {(sendingMessage || isLoading) && (
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <CircularProgress size={20} />
        </Box>
      )}
    </Box>
  );
};

export default PropertyChat;
