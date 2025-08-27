import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 채팅 메시지 타입
export interface ChatMessage {
  _id: string;
  messageId: string;
  roomId: string;
  senderId: string;
  messageType: string;
  content: string;
  status: string;
  senderAvatar?: string;
  senderNickname?: string;
  isAgent: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// 채팅방 타입
export interface ChatRoom {
  _id: string;
  roomId: string;
  roomType: string;
  userId: string;
  agentId?: string;
  propertyId: string;
  status: string;
  lastMessageContent?: string;
  lastMessageSenderId?: string;
  lastMessageTime?: string;
  unreadCountForUser: number;
  unreadCountForAgent: number;
  propertyTitle: string;
  userNickname: string;
  agentNickname?: string;
  createdAt: string;
  updatedAt: string;
}

// 채팅 상태 인터페이스
interface ChatState {
  // 채팅방별 메시지 저장
  messages: Record<string, ChatMessage[]>;
  
  // 채팅방 목록
  chatRooms: ChatRoom[];
  
  // 현재 선택된 채팅방
  selectedRoomId: string | null;
  
  // 온라인 사용자 목록
  onlineUsers: Set<string>;
  
  // 타이핑 중인 사용자
  typingUsers: Record<string, Set<string>>;
  
  // 로딩 상태
  loading: {
    messages: Record<string, boolean>;
    rooms: boolean;
  };
  
  // 에러 상태
  errors: {
    messages: Record<string, string | null>;
    rooms: string | null;
  };
}

// 채팅 액션 인터페이스
interface ChatActions {
  // 메시지 관련 액션
  addMessage: (roomId: string, message: ChatMessage) => void;
  updateMessage: (roomId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (roomId: string, messageId: string) => void;
  setMessages: (roomId: string, messages: ChatMessage[]) => void;
  clearMessages: (roomId: string) => void;
  
  // 채팅방 관련 액션
  addChatRoom: (room: ChatRoom) => void;
  updateChatRoom: (roomId: string, updates: Partial<ChatRoom>) => void;
  removeChatRoom: (roomId: string) => void;
  setChatRooms: (rooms: ChatRoom[]) => void;
  clearChatRooms: () => void;
  
  // 선택된 채팅방 관리
  setSelectedRoom: (roomId: string | null) => void;
  
  // 온라인 사용자 관리
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  setOnlineUsers: (users: Set<string>) => void;
  
  // 타이핑 상태 관리
  addTypingUser: (roomId: string, userId: string) => void;
  removeTypingUser: (roomId: string, userId: string) => void;
  clearTypingUsers: (roomId: string) => void;
  
  // 로딩 상태 관리
  setMessagesLoading: (roomId: string, loading: boolean) => void;
  setRoomsLoading: (loading: boolean) => void;
  
  // 에러 상태 관리
  setMessagesError: (roomId: string, error: string | null) => void;
  setRoomsError: (error: string | null) => void;
  
  // 전체 상태 초기화
  reset: () => void;
}

// 채팅 스토어 타입
type ChatStore = ChatState & ChatActions;

// 초기 상태
const initialState: ChatState = {
  messages: {},
  chatRooms: [],
  selectedRoomId: null,
  onlineUsers: new Set(),
  typingUsers: {},
  loading: {
    messages: {},
    rooms: false,
  },
  errors: {
    messages: {},
    rooms: null,
  },
};

// 채팅 스토어 생성
export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // 메시지 관련 액션
      addMessage: (roomId: string, message: ChatMessage) => {
        set((state) => {
          const currentMessages = state.messages[roomId] || [];
          const updatedMessages = [...currentMessages, message];
          
          // 채팅방 목록에서 해당 방의 최근 메시지 업데이트
          const updatedRooms = state.chatRooms.map(room => {
            if (room._id === roomId || room.roomId === roomId) {
              return {
                ...room,
                lastMessageContent: message.content,
                lastMessageSenderId: message.senderId,
                lastMessageTime: message.createdAt,
                unreadCountForUser: room.unreadCountForUser + 1,
                updatedAt: message.createdAt,
              };
            }
            return room;
          });

          // 최신 메시지가 있는 채팅방을 맨 위로 이동
          const roomWithNewMessage = updatedRooms.find(room => 
            room._id === roomId || room.roomId === roomId
          );
          const otherRooms = updatedRooms.filter(room => 
            room._id !== roomId && room.roomId !== roomId
          );
          const sortedRooms = roomWithNewMessage 
            ? [roomWithNewMessage, ...otherRooms]
            : updatedRooms;

          return {
            messages: {
              ...state.messages,
              [roomId]: updatedMessages,
            },
            chatRooms: sortedRooms,
          };
        });
      },

      updateMessage: (roomId: string, messageId: string, updates: Partial<ChatMessage>) => {
        set((state) => {
          const currentMessages = state.messages[roomId] || [];
          const updatedMessages = currentMessages.map(message =>
            message._id === messageId || message.messageId === messageId
              ? { ...message, ...updates }
              : message
          );

          return {
            messages: {
              ...state.messages,
              [roomId]: updatedMessages,
            },
          };
        });
      },

      deleteMessage: (roomId: string, messageId: string) => {
        set((state) => {
          const currentMessages = state.messages[roomId] || [];
          const updatedMessages = currentMessages.filter(message =>
            message._id !== messageId && message.messageId !== messageId
          );

          return {
            messages: {
              ...state.messages,
              [roomId]: updatedMessages,
            },
          };
        });
      },

      setMessages: (roomId: string, messages: ChatMessage[]) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [roomId]: messages,
          },
        }));
      },

      clearMessages: (roomId: string) => {
        set((state) => {
          const { [roomId]: _, ...remainingMessages } = state.messages;
          return { messages: remainingMessages };
        });
      },

      // 채팅방 관련 액션
      addChatRoom: (room: ChatRoom) => {
        set((state) => {
          const existingIndex = state.chatRooms.findIndex(r => r._id === room._id);
          if (existingIndex >= 0) {
            // 기존 채팅방 업데이트
            const updated = [...state.chatRooms];
            updated[existingIndex] = room;
            return { chatRooms: updated };
          } else {
            // 새 채팅방 추가
            return { chatRooms: [room, ...state.chatRooms] };
          }
        });
      },

      updateChatRoom: (roomId: string, updates: Partial<ChatRoom>) => {
        set((state) => ({
          chatRooms: state.chatRooms.map(room =>
            room._id === roomId || room.roomId === roomId
              ? { ...room, ...updates }
              : room
          ),
        }));
      },

      removeChatRoom: (roomId: string) => {
        set((state) => ({
          chatRooms: state.chatRooms.filter(room =>
            room._id !== roomId && room.roomId !== roomId
          ),
        }));
      },

      setChatRooms: (rooms: ChatRoom[]) => {
        set({ chatRooms: rooms });
      },

      clearChatRooms: () => {
        set({ chatRooms: [] });
      },

      // 선택된 채팅방 관리
      setSelectedRoom: (roomId: string | null) => {
        set({ selectedRoomId: roomId });
      },

      // 온라인 사용자 관리
      addOnlineUser: (userId: string) => {
        set((state) => {
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.add(userId);
          return { onlineUsers: newOnlineUsers };
        });
      },

      removeOnlineUser: (userId: string) => {
        set((state) => {
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.delete(userId);
          return { onlineUsers: newOnlineUsers };
        });
      },

      setOnlineUsers: (users: Set<string>) => {
        set({ onlineUsers: users });
      },

      // 타이핑 상태 관리
      addTypingUser: (roomId: string, userId: string) => {
        set((state) => {
          const currentTypingUsers = state.typingUsers[roomId] || new Set();
          const newTypingUsers = new Set(currentTypingUsers);
          newTypingUsers.add(userId);
          
          return {
            typingUsers: {
              ...state.typingUsers,
              [roomId]: newTypingUsers,
            },
          };
        });
      },

      removeTypingUser: (roomId: string, userId: string) => {
        set((state) => {
          const currentTypingUsers = state.typingUsers[roomId] || new Set();
          const newTypingUsers = new Set(currentTypingUsers);
          newTypingUsers.delete(userId);
          
          return {
            typingUsers: {
              ...state.typingUsers,
              [roomId]: newTypingUsers,
            },
          };
        });
      },

      clearTypingUsers: (roomId: string) => {
        set((state) => {
          const { [roomId]: _, ...remainingTypingUsers } = state.typingUsers;
          return { typingUsers: remainingTypingUsers };
        });
      },

      // 로딩 상태 관리
      setMessagesLoading: (roomId: string, loading: boolean) => {
        set((state) => ({
          loading: {
            ...state.loading,
            messages: {
              ...state.loading.messages,
              [roomId]: loading,
            },
          },
        }));
      },

      setRoomsLoading: (loading: boolean) => {
        set((state) => ({
          loading: {
            ...state.loading,
            rooms: loading,
          },
        }));
      },

      // 에러 상태 관리
      setMessagesError: (roomId: string, error: string | null) => {
        set((state) => ({
          errors: {
            ...state.errors,
            messages: {
              ...state.errors.messages,
              [roomId]: error,
            },
          },
        }));
      },

      setRoomsError: (error: string | null) => {
        set((state) => ({
          errors: {
            ...state.errors,
            rooms: error,
          },
        }));
      },

      // 전체 상태 초기화
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'chat-store',
    }
  )
);
