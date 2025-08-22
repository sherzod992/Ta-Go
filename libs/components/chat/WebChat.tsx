import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useChatSubscriptions } from '../../hooks/useChatSubscriptions';
import { GET_CHAT_MESSAGES, GET_CHAT_ROOMS } from '../../../apollo/user/query';
import { SEND_MESSAGE } from '../../../apollo/user/mutation';
import { ChatMessage, ChatRoom } from '../../types/chat/chat';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  Typography,
  Paper,
  Avatar,
  Badge,
  Chip,
  Alert,
  Snackbar,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';

interface WebChatProps {
  roomId?: string;
  propertyId?: string;
}

const WebChat: React.FC<WebChatProps> = ({ roomId, propertyId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
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
      setNotificationMessage('메시지 전송에 실패했습니다.');
      setShowNotification(true);
    },
  });

  // GraphQL Subscription 사용 (완전한 예시)
  const {
    onMessageSent,
    onChatRoomUpdated,
    onChatNotification,
    onTypingIndicator,
    onMessageRead,
    onUserOnlineStatus,
    onChatRoomStatusChanged,
  } = useChatSubscriptions({
    roomId,
    onMessageSent: (message: ChatMessage) => {
      console.log('새 메시지 수신:', message);
      setMessages(prev => [...prev, message]);
      scrollToBottom();
      
      // 알림 표시
      setNotificationMessage(`새 메시지: ${message.content.substring(0, 30)}...`);
      setShowNotification(true);
    },
    onChatRoomUpdated: (room: ChatRoom) => {
      console.log('채팅방 업데이트:', room);
      setChatRooms(prev => 
        prev.map(r => r._id === room._id ? room : r)
      );
    },
    onChatNotification: (notification: any) => {
      console.log('채팅 알림 수신:', notification);
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // 최대 10개 유지
      
      // 알림 표시
      setNotificationMessage(notification.title || '새 알림이 있습니다.');
      setShowNotification(true);
    },
    onTypingIndicator: (data: any) => {
      console.log('타이핑 상태:', data);
      // 타이핑 상태 UI 업데이트 로직
    },
    onMessageRead: (data: any) => {
      console.log('메시지 읽음 처리:', data);
      // 메시지 읽음 상태 업데이트 로직
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
    onChatRoomStatusChanged: (room: any) => {
      console.log('채팅방 상태 변경:', room);
      // 채팅방 상태 변경 처리 로직
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

  // 알림 닫기
  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  if (messagesLoading || roomsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '700px', border: '1px solid #ddd', borderRadius: 2 }}>
      {/* 채팅방 목록 */}
      <Box sx={{ width: '350px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #ddd', bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatIcon />
            채팅방 목록
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </Typography>
        </Box>
        
        <List sx={{ flex: 1, overflow: 'auto' }}>
          {chatRooms.map((room) => (
            <ListItem 
              key={room._id} 
              button 
              sx={{ 
                borderBottom: '1px solid #eee',
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
          ))}
        </List>
      </Box>

      {/* 채팅 메시지 영역 */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 메시지 목록 */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#fafafa' }}>
          {messages.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography color="text.secondary">메시지가 없습니다.</Typography>
            </Box>
          ) : (
            messages.map((message) => (
              <Box
                key={message._id}
                sx={{
                  display: 'flex',
                  justifyContent: message.isAgent ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, maxWidth: '70%' }}>
                  {!message.isAgent && (
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#FF9500' }}>
                      {message.senderNickname?.charAt(0) || 'U'}
                    </Avatar>
                  )}
                  
                  <Paper
                    sx={{
                      p: 1.5,
                      backgroundColor: message.isAgent ? '#e3f2fd' : 'white',
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {message.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                  
                  {message.isAgent && (
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#4caf50' }}>
                      A
                    </Avatar>
                  )}
                </Box>
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* 메시지 입력 */}
        <Box sx={{ p: 2, borderTop: '1px solid #ddd', bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
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
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              endIcon={<SendIcon />}
              sx={{
                bgcolor: '#FF9500',
                '&:hover': { bgcolor: '#FF6B00' }
              }}
            >
              전송
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 알림 스낵바 */}
      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity="info" sx={{ width: '100%' }}>
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WebChat;
