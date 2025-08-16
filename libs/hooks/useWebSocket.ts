import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';

interface UseWebSocketOptions {
  onMessage?: (message: any) => void;
  onTyping?: (data: any) => void;
  onUserJoined?: (data: any) => void;
  onUserLeft?: (data: any) => void;
  onRead?: (data: any) => void;
  onNotification?: (notification: any) => void;
}

interface TypingData {
  roomId: string;
  userId: string;
  userNickname: string;
  isTyping: boolean;
}

interface MessageData {
  _id: string;
  messageId: string;
  roomId: string;
  senderId: string;
  content: string;
  senderNickname: string;
  createdAt: string;
  isAgent: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  isSystem: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const user = useReactiveVar(userVar);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // WebSocket 연결 초기화
  const connect = useCallback(() => {
    if (!user?._id) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_API_WS || 'ws://localhost:3000/chat', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('WebSocket 연결됨');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket 연결 끊어짐');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket 연결 에러:', error);
      setIsConnected(false);
    });

    // 새 메시지 수신
    socket.on('newMessage', (message: MessageData) => {
      console.log('새 메시지 수신:', message);
      options.onMessage?.(message);
    });

    // 타이핑 상태 수신
    socket.on('userTyping', (data: TypingData) => {
      console.log('타이핑 상태 수신:', data);
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
      options.onTyping?.(data);
    });

    // 사용자 참가
    socket.on('userJoined', (data) => {
      console.log('사용자 참가:', data);
      options.onUserJoined?.(data);
    });

    // 사용자 나가기
    socket.on('userLeft', (data) => {
      console.log('사용자 나가기:', data);
      options.onUserLeft?.(data);
    });

    // 읽음 처리
    socket.on('messageRead', (data) => {
      console.log('메시지 읽음:', data);
      options.onRead?.(data);
    });

    // 알림
    socket.on('newNotification', (notification) => {
      console.log('새 알림:', notification);
      options.onNotification?.(notification);
    });

    socketRef.current = socket;
  }, [user?._id, options]);

  // WebSocket 연결 해제
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setCurrentRoom(null);
      setTypingUsers(new Set());
    }
  }, []);

  // 채팅방 참가
  const joinRoom = useCallback((roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('joinRoom', { roomId });
      setCurrentRoom(roomId);
      console.log(`채팅방 참가: ${roomId}`);
    }
  }, [isConnected]);

  // 채팅방 나가기
  const leaveRoom = useCallback((roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leaveRoom', { roomId });
      if (currentRoom === roomId) {
        setCurrentRoom(null);
      }
      console.log(`채팅방 나가기: ${roomId}`);
    }
  }, [isConnected, currentRoom]);

  // 타이핑 상태 전송
  const sendTypingStatus = useCallback((roomId: string, isTyping: boolean) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', { roomId, isTyping });
    }
  }, [isConnected]);

  // 메시지 읽음 처리
  const markAsRead = useCallback((roomId: string, messageIds: string[]) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('markAsRead', { roomId, messageIds });
    }
  }, [isConnected]);

  // 컴포넌트 마운트 시 연결
  useEffect(() => {
    connect();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // 사용자 변경 시 재연결
  useEffect(() => {
    if (user?._id) {
      connect();
    } else {
      disconnect();
    }
  }, [user?._id, connect, disconnect]);

  return {
    isConnected,
    currentRoom,
    typingUsers: Array.from(typingUsers),
    joinRoom,
    leaveRoom,
    sendTypingStatus,
    markAsRead,
    socket: socketRef.current,
  };
};
