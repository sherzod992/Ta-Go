import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGlobalChat } from '../../hooks/useGlobalChat';
import { ChatMessage } from '../../types/chat/chat';
import { ChatRoom as ChatRoomType } from '../../stores/chatStore';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  Home as HomeIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';

interface ChatRoomProps {
  selectedRoom: ChatRoomType | null;
  onMessageSent?: (message: ChatMessage) => void;
}

interface MessageGroup {
  senderId: string;
  isAgent: boolean;
  messages: ChatMessage[];
  timestamp: Date;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  selectedRoom,
  onMessageSent,
}) => {
  const [messageGroups, setMessageGroups] = useState<MessageGroup[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // 전역 채팅 훅 사용
  const {
    messages,
    loading,
    errors,
    sendMessage,
    markAsRead,
    sendTypingStatus,
    refetchMessages,
  } = useGlobalChat(selectedRoom?.roomId || selectedRoom?._id);

  // 메시지를 그룹으로 묶는 함수 (카카오톡 스타일)
  const groupMessages = useCallback((messages: ChatMessage[]): MessageGroup[] => {
    if (!messages.length) return [];
    
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;
    
    // 시간 순서대로 정렬 (오래된 메시지부터 - 아래에서 위로 쌓임)
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    sortedMessages.forEach((message) => {
      const messageTime = new Date(message.createdAt);
      
      // 새로운 그룹을 시작하는 조건 (3분 이상 차이나면 새 그룹)
      if (!currentGroup || 
          currentGroup.senderId !== message.senderId ||
          messageTime.getTime() - currentGroup.timestamp.getTime() > 3 * 60 * 1000) {
        
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
        // 그룹의 첫 번째 메시지 시간 유지 (시간 표시용)
      }
    });
    
    return groups;
  }, []);

  // 메시지 데이터 처리
  useEffect(() => {
    if (messages.length > 0) {
      setHasMoreMessages(messages.length >= 20);
    }
  }, [messages]);

  // 메시지 그룹 업데이트
  useEffect(() => {
    setMessageGroups(groupMessages(messages));
  }, [messages, groupMessages]);

  // 채팅방 변경 시 초기화
  useEffect(() => {
    if (selectedRoom) {
      setMessageGroups([]);
      setCurrentPage(1);
      setHasMoreMessages(true);
      setShouldAutoScroll(true);
    }
  }, [selectedRoom?.roomId]);

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
    if (!newMessage.trim() || !selectedRoom?.roomId || loading.messages) return;

    try {
      await sendMessage(newMessage.trim(), 'TEXT');
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

  // 선택된 채팅방이 없는 경우
  if (!selectedRoom) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#fafafa'
      }}>
        <Typography color="text.secondary" variant="h6">
          채팅방을 선택해주세요
        </Typography>
      </Box>
    );
  }

  if (loading.messages && currentPage === 1) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      {/* 헤더 */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid #ddd', 
        bgcolor: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Avatar sx={{ 
          width: 40, 
          height: 40, 
          bgcolor: selectedRoom.roomType === 'PROPERTY_INQUIRY' ? '#FF9500' : '#4caf50',
          fontSize: '1rem'
        }}>
          {selectedRoom.roomType === 'PROPERTY_INQUIRY' ? (
            <HomeIcon />
          ) : (
            selectedRoom.agentNickname?.charAt(0) || selectedRoom.userNickname?.charAt(0) || '?'
          )}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {selectedRoom.agentNickname || selectedRoom.userNickname || '알 수 없음'}
          </Typography>
          
          {selectedRoom.roomType === 'PROPERTY_INQUIRY' && selectedRoom.propertyTitle && (
            <Chip
              label={selectedRoom.propertyTitle}
              size="small"
              icon={<HomeIcon />}
              sx={{
                height: 24,
                fontSize: '0.75rem',
                bgcolor: '#fff3e0',
                color: '#FF9500',
                border: '1px solid #FFB74D',
              }}
            />
          )}
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
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1,
            minHeight: '100%',
            justifyContent: 'flex-end' // 메시지들을 하단에 배치
          }}>
            {messageGroups.map((group, groupIndex) => (
              <Box
                key={`${group.senderId}-${group.timestamp.getTime()}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: group.isAgent ? 'flex-start' : 'flex-end',
                  mb: 2,
                }}
              >
                {/* 시간 표시 (그룹의 첫 번째에만) */}
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
                    {group.timestamp.toLocaleDateString()} {group.timestamp.toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    })}
                  </Typography>
                </Box>
                
                {/* 메시지 그룹 */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  gap: 1, 
                  maxWidth: '70%',
                  width: '100%',
                  justifyContent: group.isAgent ? 'flex-start' : 'flex-end'
                }}>
                  {/* 상대방 아바타 (첫 번째 메시지에만) */}
                  {group.isAgent && (
                    <Avatar sx={{ 
                      width: 28, 
                      height: 28, 
                      bgcolor: '#4caf50', 
                      fontSize: '0.7rem',
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
                    alignItems: group.isAgent ? 'flex-start' : 'flex-end',
                    maxWidth: '280px'
                  }}>
                    {group.messages.map((message, messageIndex) => (
                      <Box
                        key={message._id}
                        sx={{
                          display: 'flex',
                          flexDirection: group.isAgent ? 'row' : 'row-reverse',
                          alignItems: 'flex-end',
                          gap: 0.5,
                          width: '100%',
                          justifyContent: group.isAgent ? 'flex-start' : 'flex-end'
                        }}
                      >
                        {/* 말풍선 */}
                        <Box
                          sx={{
                            p: 1.5,
                            backgroundColor: group.isAgent ? '#f1f3f4' : '#FF9500',
                            color: group.isAgent ? '#333' : 'white',
                            borderRadius: 3,
                            maxWidth: '280px',
                            wordBreak: 'break-word',
                            position: 'relative',
                            // 카카오톡 스타일 말풍선 꼬리
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              bottom: 0,
                              width: 0,
                              height: 0,
                              border: '6px solid transparent',
                              ...(group.isAgent ? {
                                left: -6,
                                borderRightColor: '#f1f3f4',
                              } : {
                                right: -6,
                                borderLeftColor: '#FF9500',
                              })
                            },
                            // 연속된 메시지 스타일링
                            ...(messageIndex > 0 && {
                              marginTop: 0.5,
                              '&::after': {
                                display: 'none' // 연속 메시지에서는 꼬리 숨김
                              }
                            }),
                            ...(messageIndex === 0 && {
                              '&::after': {
                                display: 'block'
                              }
                            })
                          }}
                        >
                          <Typography variant="body2" sx={{ 
                            wordBreak: 'break-word',
                            lineHeight: 1.4,
                            fontSize: '0.9rem'
                          }}>
                            {message.content}
                          </Typography>
                        </Box>
                        
                        {/* 개별 메시지 시간 (첫 번째 메시지에만) */}
                        {messageIndex === 0 && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontSize: '0.65rem',
                              color: 'text.secondary',
                              mb: 0.5,
                              alignSelf: 'flex-end'
                            }}
                          >
                            {new Date(message.createdAt).toLocaleTimeString('ko-KR', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false 
                            })}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* 메시지 입력 (카카오톡 스타일) */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid #e0e0e0', 
        bgcolor: '#f8f9fa',
        display: 'flex',
        gap: 1,
        alignItems: 'flex-end'
      }}>
        <Box sx={{ 
          flex: 1,
          bgcolor: 'white',
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'flex-end',
          minHeight: 40,
          maxHeight: 120,
          overflow: 'hidden'
        }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="메시지를 입력하세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="standard"
            size="small"
            disabled={loading.messages}
            sx={{
              '& .MuiInputBase-root': {
                border: 'none',
                '&:before': { border: 'none' },
                '&:after': { border: 'none' },
                '&:hover:not(.Mui-disabled):before': { border: 'none' },
              },
              '& .MuiInputBase-input': {
                padding: '10px 16px',
                fontSize: '0.9rem',
              }
            }}
          />
        </Box>
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || loading.messages}
          sx={{
            bgcolor: newMessage.trim() ? '#FF9500' : '#e0e0e0',
            color: newMessage.trim() ? 'white' : '#999',
            minWidth: 40,
            height: 40,
            borderRadius: '50%',
            '&:hover': { 
              bgcolor: newMessage.trim() ? '#FF6B00' : '#e0e0e0' 
            },
            '&:disabled': {
              bgcolor: '#e0e0e0',
              color: '#999'
            }
          }}
        >
          <SendIcon sx={{ fontSize: 18 }} />
        </Button>
      </Box>

      {/* 로딩 상태 표시 */}
      {loading.messages && (
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <CircularProgress size={20} />
        </Box>
      )}
    </Box>
  );
};

export default ChatRoom;
