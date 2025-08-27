import { useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useChatStore, ChatMessage, ChatRoom } from '../stores/chatStore';
import { useChatSubscriptions } from './useChatSubscriptions';
import { 
  GET_CHAT_MESSAGES, 
  GET_CHAT_ROOMS
} from '../../apollo/user/query';
import { 
  SEND_MESSAGE as SEND_MESSAGE_MUTATION,
  CREATE_CHAT_ROOM as CREATE_CHAT_ROOM_MUTATION 
} from '../../apollo/user/mutation';

// 전역 채팅 훅
export const useGlobalChat = (roomId?: string) => {
  const {
    // 상태
    messages,
    chatRooms,
    selectedRoomId,
    onlineUsers,
    typingUsers,
    loading,
    errors,
    
    // 액션
    addMessage,
    updateMessage,
    deleteMessage,
    setMessages,
    clearMessages,
    addChatRoom,
    updateChatRoom,
    removeChatRoom,
    setChatRooms,
    clearChatRooms,
    setSelectedRoom,
    addOnlineUser,
    removeOnlineUser,
    setOnlineUsers,
    addTypingUser,
    removeTypingUser,
    clearTypingUsers,
    setMessagesLoading,
    setRoomsLoading,
    setMessagesError,
    setRoomsError,
    reset,
  } = useChatStore();

  // 현재 채팅방의 메시지들
  const currentMessages = roomId ? messages[roomId] || [] : [];
  
  // 현재 채팅방 정보
  const currentRoom = chatRooms.find(room => 
    room._id === roomId || room.roomId === roomId
  );

  // 메시지 조회 쿼리 (채팅방 ID가 있을 때만)
  const { data: messagesData, loading: messagesLoading, refetch: refetchMessages } = useQuery(
    GET_CHAT_MESSAGES,
    {
      variables: { input: { roomId: roomId || '', page: 1, limit: 50 } },
      skip: !roomId,
      onCompleted: (data) => {
        if (data?.getChatMessages?.list && roomId) {
          console.log('메시지 데이터 수신:', { roomId, count: data.getChatMessages.list.length });
          setMessages(roomId, data.getChatMessages.list);
        }
      },
      onError: (error) => {
        if (roomId) {
          console.error('메시지 조회 오류:', error);
          setMessagesError(roomId, error.message);
        }
      },
    }
  );

  // 채팅방 목록 조회 쿼리
  const { data: roomsData, loading: roomsLoading, refetch: refetchRooms } = useQuery(
    GET_CHAT_ROOMS,
    {
      variables: { 
        input: { 
          page: 1, 
          limit: 20,
          status: 'ACTIVE',
          roomType: 'PROPERTY_INQUIRY'
        } 
      },
      onCompleted: (data) => {
        if (data?.getChatRooms?.list) {
          setChatRooms(data.getChatRooms.list);
        }
      },
      onError: (error) => {
        setRoomsError(error.message);
      },
    }
  );

  // 메시지 전송 뮤테이션
  const [sendMessageMutation] = useMutation(SEND_MESSAGE_MUTATION, {
    onCompleted: (data) => {
      if (data?.sendMessage) {
        // 전역 상태에 메시지 추가 (이미 서버에서 받은 메시지이므로 중복 방지)
        const newMessage = data.sendMessage;
        if (!currentMessages.find(msg => msg._id === newMessage._id)) {
          addMessage(roomId!, newMessage);
        }
      }
    },
    onError: (error) => {
      console.error('메시지 전송 실패:', error);
    },
  });

  // 채팅방 생성 뮤테이션
  const [createChatRoomMutation] = useMutation(CREATE_CHAT_ROOM_MUTATION, {
    onCompleted: (data) => {
      if (data?.createChatRoom) {
        console.log('채팅방 생성 완료:', data.createChatRoom);
        addChatRoom(data.createChatRoom);
        setSelectedRoom(data.createChatRoom._id);
      }
    },
    onError: (error) => {
      console.error('채팅방 생성 실패:', error);
    },
  });

  // GraphQL Subscription 설정
  const { onMessageSent, onChatRoomUpdated, onUserOnlineStatus, onTypingIndicator } = useChatSubscriptions({
    roomId,
    onMessageSent: (message: ChatMessage) => {
      console.log('새 메시지 수신 (전역):', message);
      // 전역 상태에 메시지 추가
      addMessage(message.roomId, message);
    },
    onChatRoomUpdated: (room: ChatRoom) => {
      console.log('채팅방 업데이트 (전역):', room);
      // 전역 상태에 채팅방 업데이트 (기존 채팅방이 있으면 업데이트, 없으면 추가)
      const existingRoom = chatRooms.find(r => r._id === room._id || r.roomId === room.roomId);
      if (existingRoom) {
        updateChatRoom(room._id || room.roomId, room);
      } else {
        addChatRoom(room);
      }
    },
    onUserOnlineStatus: (status: any) => {
      console.log('사용자 온라인 상태 (전역):', status);
      if (status.isOnline) {
        addOnlineUser(status.userId);
      } else {
        removeOnlineUser(status.userId);
      }
    },
    onTypingIndicator: (data: any) => {
      console.log('타이핑 상태 (전역):', data);
      if (data.isTyping) {
        addTypingUser(data.roomId, data.userId);
      } else {
        removeTypingUser(data.roomId, data.userId);
      }
    },
  });

  // 메시지 전송 함수
  const sendMessage = useCallback(async (content: string, messageType: string = 'TEXT') => {
    if (!roomId || !content.trim()) return;

    try {
      setMessagesLoading(roomId, true);
      
      await sendMessageMutation({
        variables: {
          input: {
            roomId,
            content: content.trim(),
            messageType,
          },
        },
      });
      
      // 메시지 전송 성공 후 즉시 로딩 상태 해제
      setMessagesLoading(roomId, false);
    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
      setMessagesError(roomId, '메시지 전송에 실패했습니다.');
      setMessagesLoading(roomId, false);
    }
  }, [roomId, sendMessageMutation, setMessagesLoading, setMessagesError]);

  // 채팅방 생성 함수
  const createChatRoom = useCallback(async (propertyId: string, agentId?: string) => {
    try {
      setRoomsLoading(true);
      
      await createChatRoomMutation({
        variables: {
          input: {
            propertyId,
            agentId,
            roomType: 'PROPERTY_INQUIRY',
          },
        },
      });
    } catch (error) {
      console.error('채팅방 생성 중 오류:', error);
      setRoomsError('채팅방 생성에 실패했습니다.');
    } finally {
      setRoomsLoading(false);
    }
  }, [createChatRoomMutation, setRoomsLoading, setRoomsError]);

  // 메시지 읽음 처리
  const markAsRead = useCallback((messageIds: string[]) => {
    if (!roomId) return;
    
    // 전역 상태에서 메시지 읽음 상태 업데이트
    messageIds.forEach(messageId => {
      updateMessage(roomId, messageId, { status: 'READ' });
    });
    
    // 채팅방의 읽지 않은 메시지 수 감소
    if (currentRoom) {
      updateChatRoom(roomId, {
        unreadCountForUser: Math.max(0, currentRoom.unreadCountForUser - messageIds.length)
      });
    }
  }, [roomId, currentRoom, updateMessage, updateChatRoom]);

  // 타이핑 상태 전송
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!roomId) return;
    
    // WebSocket을 통해 타이핑 상태 전송
    // (실제 구현에서는 WebSocket 훅과 연동)
    console.log('타이핑 상태 전송:', { roomId, isTyping });
  }, [roomId]);

  // 채팅방 선택
  const selectRoom = useCallback((roomId: string) => {
    setSelectedRoom(roomId);
  }, [setSelectedRoom]);

  // 채팅방 나가기
  const leaveRoom = useCallback((roomId: string) => {
    if (selectedRoomId === roomId) {
      setSelectedRoom(null);
    }
    // 채팅방 목록에서 제거하지 않고 상태만 변경
  }, [selectedRoomId, setSelectedRoom]);

  // 로딩 상태 동기화
  useEffect(() => {
    if (roomId) {
      console.log('메시지 로딩 상태 업데이트:', { roomId, messagesLoading });
      setMessagesLoading(roomId, messagesLoading);
    }
  }, [roomId, messagesLoading, setMessagesLoading]);

  useEffect(() => {
    console.log('채팅방 목록 로딩 상태 업데이트:', { roomsLoading });
    setRoomsLoading(roomsLoading);
  }, [roomsLoading, setRoomsLoading]);

  return {
    // 상태
    messages: currentMessages,
    chatRooms,
    selectedRoomId,
    currentRoom,
    onlineUsers,
    typingUsers: roomId ? typingUsers[roomId] || new Set() : new Set(),
    loading: {
      messages: roomId ? loading.messages[roomId] || false : false,
      rooms: loading.rooms,
    },
    errors: {
      messages: roomId ? errors.messages[roomId] || null : null,
      rooms: errors.rooms,
    },

    // 액션
    sendMessage,
    createChatRoom,
    markAsRead,
    sendTypingStatus,
    selectRoom,
    leaveRoom,
    refetchMessages,
    refetchRooms,
    reset,

    // 원본 데이터 (필요시 사용)
    messagesData,
    roomsData,
  };
};
