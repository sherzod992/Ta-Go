import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_USER_CHAT_ROOMS, GET_CHAT_MESSAGES } from '../../apollo/user/query';
import { CREATE_CHAT_ROOM } from '../../apollo/user/mutation';
import { ChatRoom, ChatMessage } from '../types/chat/chat';
import { CreateChatRoomInput } from '../types/chat/chat.input';
import { sweetErrorAlert } from '../sweetAlert';
import { useChatSubscriptions } from './useChatSubscriptions';

export const useChatManager = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  // 사용자의 모든 채팅방 조회
  const { data: userChatRoomsData, loading: loadingChatRooms, refetch: refetchChatRooms } = useQuery(GET_ALL_USER_CHAT_ROOMS, {
    variables: { userId: userId || '' },
    skip: !userId,
    onError: (error) => {
      console.error('채팅방 목록 조회 에러:', error);
      sweetErrorAlert('채팅방 목록을 불러오는데 실패했습니다.');
    },
    onCompleted: (data) => {
      if (data?.getAllUserChatRooms) {
        setChatRooms(data.getAllUserChatRooms);
      }
    }
  });

  // 채팅방 생성
  const [createChatRoom] = useMutation(CREATE_CHAT_ROOM, {
    onError: (error) => {
      console.error('채팅방 생성 에러:', error);
      sweetErrorAlert('채팅방 생성에 실패했습니다.');
    }
  });

  // GraphQL Subscription 사용
  const { onChatRoomUpdated, onMessageSent } = useChatSubscriptions({
    onChatRoomUpdated: (room: ChatRoom) => {
      console.log('채팅방 업데이트 수신:', room);
      setChatRooms(prev => {
        const existingIndex = prev.findIndex(r => r._id === room._id);
        if (existingIndex >= 0) {
          // 기존 채팅방 업데이트 및 맨 위로 이동
          const updated = [...prev];
          updated[existingIndex] = room;
          return [room, ...updated.filter((_, index) => index !== existingIndex)];
        } else {
          // 새 채팅방 추가
          return [room, ...prev];
        }
      });
    },
    onMessageSent: (message: ChatMessage) => {
      console.log('새 메시지 수신:', message);
      // 채팅방 목록에서 해당 채팅방의 최근 메시지 업데이트
      setChatRooms(prev => prev.map(room => {
        if (room._id === message.roomId || room.roomId === message.roomId) {
          return {
            ...room,
            lastMessageContent: message.content,
            lastMessageTime: message.createdAt,
            unreadCountForUser: room.unreadCountForUser + 1
          };
        }
        return room;
      }));
    },
  });

  // 채팅방 찾기 또는 생성
  const findOrCreateChatRoom = useCallback(async (propertyId: string): Promise<ChatRoom | null> => {
    if (!userId) {
      sweetErrorAlert('로그인이 필요합니다.');
      return null;
    }

    setIsLoading(true);

    try {
      // 기존 채팅방 찾기
      const existingRoom = chatRooms.find(
        (room: ChatRoom) => room.propertyId === propertyId && room.roomType === 'PROPERTY_INQUIRY'
      );

      if (existingRoom) {
        console.log('기존 채팅방 발견:', existingRoom);
        return existingRoom;
      }

      // 새 채팅방 생성
      console.log('새 채팅방 생성 시작:', { propertyId, userId });
      
      const result = await createChatRoom({
        variables: {
          input: {
            roomType: 'PROPERTY_INQUIRY',
            propertyId: propertyId,
            userId: userId
          } as CreateChatRoomInput
        }
      });

      if (result.data?.createChatRoom) {
        const newRoom = result.data.createChatRoom;
        console.log('채팅방 생성 성공:', newRoom);
        
        // 채팅방 목록에 즉시 추가 (Subscription 대기 없이)
        setChatRooms(prev => [newRoom, ...prev]);
        
        return newRoom;
      }
    } catch (error) {
      console.error('채팅방 생성 중 에러:', error);
      
      // 이미 존재하는 채팅방 에러인 경우 기존 채팅방 찾기
      if (error instanceof Error && error.message.includes('이미 존재하는 채팅방')) {
        const existingRoom = chatRooms.find(
          (room: ChatRoom) => room.propertyId === propertyId && room.roomType === 'PROPERTY_INQUIRY'
        );
        if (existingRoom) {
          return existingRoom;
        }
      }
    } finally {
      setIsLoading(false);
    }

    return null;
  }, [userId, chatRooms, createChatRoom]);

  // 채팅방 선택
  const selectChatRoom = useCallback((chatId: string) => {
    console.log('채팅방 선택:', chatId);
    setCurrentChatId(chatId);
  }, []);

  // 채팅방 ID로 채팅방 찾기
  const getChatRoomById = useCallback((chatId: string): ChatRoom | undefined => {
    return chatRooms.find(room => room._id === chatId || room.roomId === chatId);
  }, [chatRooms]);

  // 매물 ID로 채팅방 찾기
  const getChatRoomByPropertyId = useCallback((propertyId: string): ChatRoom | undefined => {
    return chatRooms.find(room => room.propertyId === propertyId && room.roomType === 'PROPERTY_INQUIRY');
  }, [chatRooms]);

  // 채팅방 목록 새로고침
  const refreshChatRooms = useCallback(async () => {
    try {
      await refetchChatRooms();
    } catch (error) {
      console.error('채팅방 목록 새로고침 실패:', error);
    }
  }, [refetchChatRooms]);

  // 채팅방 상태 업데이트
  const updateChatRoomStatus = useCallback((chatId: string, updates: Partial<ChatRoom>) => {
    setChatRooms(prev => prev.map(room => 
      (room._id === chatId || room.roomId === chatId) 
        ? { ...room, ...updates }
        : room
    ));
  }, []);

  // 새 채팅방 추가 (외부에서 호출 가능)
  const addNewChatRoom = useCallback((newRoom: ChatRoom) => {
    setChatRooms(prev => [newRoom, ...prev]);
  }, []);

  // 메시지 전송 후 채팅방 업데이트
  const updateChatRoomWithMessage = useCallback((roomId: string, message: ChatMessage) => {
    setChatRooms(prev => prev.map(room => {
      if (room._id === roomId || room.roomId === roomId) {
        return {
          ...room,
          lastMessageContent: message.content,
          lastMessageTime: message.createdAt,
          unreadCountForUser: room.unreadCountForUser + 1
        };
      }
      return room;
    }));
  }, []);

  return {
    // 상태
    chatRooms,
    currentChatId,
    isLoading: isLoading || loadingChatRooms,
    
    // 메서드
    findOrCreateChatRoom,
    selectChatRoom,
    getChatRoomById,
    getChatRoomByPropertyId,
    refreshChatRooms,
    updateChatRoomStatus,
    refetchChatRooms,
    addNewChatRoom,
    updateChatRoomWithMessage,
  };
};
