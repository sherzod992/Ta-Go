import React from 'react';
import {
  Box,
  List,
  ListItem,
  Typography,
  Avatar,
  Badge,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import {
  Circle as CircleIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { ChatRoom } from '../../stores/chatStore';
import { useTranslation } from '../../hooks/useTranslation';

interface ChatRoomListProps {
  chatRooms: ChatRoom[];
  selectedRoomId?: string | null;
  onRoomSelect: (roomId: string) => void;
  onlineUsers?: Set<string>;
  loading?: boolean;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({
  chatRooms,
  selectedRoomId,
  onRoomSelect,
  onlineUsers = new Set(),
  loading = false,
}) => {
  const { t } = useTranslation();
  // 시간 포맷팅 함수
  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      // 24시간 이내면 시간만 표시
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else if (diffInHours < 24 * 7) {
      // 7일 이내면 요일 표시
      return date.toLocaleDateString('ko-KR', { weekday: 'short' });
    } else {
      // 그 이상이면 날짜 표시
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // 메시지 내용 미리보기 (최대 30자)
  const getMessagePreview = (content: string | null | undefined) => {
    if (!content) return t('No message');
    return content.length > 30 ? content.substring(0, 30) + '...' : content;
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">{t('Loading chat list...')}</Typography>
      </Box>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary" variant="body2">
          {t('No chat history yet')}
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ p: 0, height: '100%', overflow: 'auto' }}>
      {chatRooms.map((room, index) => {
        const isSelected = selectedRoomId === room.roomId;
        const isOnline = (room.userId && onlineUsers.has(room.userId)) || (room.agentId && onlineUsers.has(room.agentId));
        const hasUnread = room.unreadCountForUser > 0;
        
        return (
          <React.Fragment key={room._id}>
            <ListItem
              button
              onClick={() => onRoomSelect(room.roomId)}
              sx={{
                p: 2,
                bgcolor: isSelected ? '#f0f7ff' : 'transparent',
                borderLeft: isSelected ? '3px solid #FF9500' : '3px solid transparent',
                '&:hover': {
                  bgcolor: isSelected ? '#f0f7ff' : '#f5f5f5',
                },
                cursor: 'pointer',
              }}
            >
              <Box sx={{ width: '100%' }}>
                {/* 상단: 상대방 이름과 시간 */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 0.5
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    {/* 매물 채팅 표시 */}
                    {room.roomType === 'PROPERTY_INQUIRY' && (
                      <HomeIcon sx={{ fontSize: 16, color: '#FF9500' }} />
                    )}
                    
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: hasUnread ? 'bold' : 'normal',
                        color: hasUnread ? '#000' : 'text.primary',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {room.agentNickname || room.userNickname || t('Unknown')}
                    </Typography>
                    
                    {/* 온라인 상태 */}
                    {isOnline && (
                      <CircleIcon sx={{ fontSize: 8, color: '#4caf50' }} />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {formatTime(room.lastMessageTime)}
                    </Typography>
                    
                    {/* 읽지 않은 메시지 수 */}
                    {hasUnread && (
                      <Badge 
                        badgeContent={room.unreadCountForUser} 
                        color="error"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.7rem',
                            height: 18,
                            minWidth: 18,
                          }
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* 중간: 매물 제목 (매물 채팅인 경우) */}
                {room.roomType === 'PROPERTY_INQUIRY' && room.propertyTitle && (
                  <Box sx={{ mb: 0.5 }}>
                    <Chip
                      label={room.propertyTitle}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        borderColor: '#FF9500',
                        color: '#FF9500',
                        maxWidth: '100%',
                        '& .MuiChip-label': {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }
                      }}
                    />
                  </Box>
                )}

                {/* 하단: 마지막 메시지 */}
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: hasUnread ? 'medium' : 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getMessagePreview(room.lastMessageContent)}
                </Typography>
              </Box>
            </ListItem>
            
            {index < chatRooms.length - 1 && (
              <Divider sx={{ ml: 2, mr: 2 }} />
            )}
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default ChatRoomList;
