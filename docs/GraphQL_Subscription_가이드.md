# GraphQL Subscription 사용 가이드

## 개요

이 문서는 TA-GO 프로젝트에서 GraphQL Subscription을 사용하여 실시간 채팅 기능을 구현하는 방법을 설명합니다.

## 1. 백엔드 설정 (NestJS/Express + GraphQL)

### 1.1 GraphQL Schema 정의

```graphql
type Subscription {
  messageSent(roomId: String!): ChatMessage!
  messageUpdated(roomId: String!): ChatMessage!
  typingIndicator(roomId: String!): TypingIndicator!
  chatNotification(memberId: String!): ChatNotification!
  messageRead(roomId: String!): MessageRead!
  chatRoomUpdated: ChatRoom!
  roomMessages(roomId: String!): [ChatMessage!]!
  userChatRooms(userId: String!): [ChatRoom!]!
  chatRoomStatusChanged(roomId: String!): ChatRoom!
  userOnlineStatus(userId: String!): UserOnlineStatus!
}

type ChatMessage {
  _id: ID!
  messageId: String!
  roomId: String!
  senderId: String!
  messageType: String!
  content: String!
  status: String!
  senderAvatar: String
  senderNickname: String
  isAgent: Boolean!
  isEdited: Boolean!
  isDeleted: Boolean!
  isPinned: Boolean!
  isSystem: Boolean!
  createdAt: String!
  updatedAt: String!
}

type ChatRoom {
  _id: ID!
  roomId: String!
  roomType: String!
  userId: String!
  agentId: String
  propertyId: String!
  status: String!
  lastMessageContent: String
  lastMessageSenderId: String
  lastMessageTime: String
  unreadCountForUser: Int!
  unreadCountForAgent: Int!
  propertyTitle: String!
  userNickname: String!
  agentNickname: String
  createdAt: String!
  updatedAt: String!
}

type ChatNotification {
  _id: ID!
  type: String!
  title: String!
  roomId: String
  messageId: String
  senderId: String
  content: String
  userId: String!
  isRead: Boolean!
  data: String
  timestamp: String!
  createdAt: String!
}

type TypingIndicator {
  roomId: String!
  userId: String!
  userNickname: String!
  isTyping: Boolean!
  timestamp: String!
}

type MessageRead {
  roomId: String!
  userId: String!
  messageIds: [String!]!
  timestamp: String!
}

type UserOnlineStatus {
  userId: String!
  isOnline: Boolean!
  lastSeen: String!
  status: String!
}
```

### 1.2 NestJS Resolver 구현

```typescript
// chat.resolver.ts
import { Resolver, Subscription, Mutation, Args, ResolveField } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { UseGuards } from '@nestjs/common';

const pubSub = new PubSub();

@Resolver()
export class ChatResolver {
  @Subscription(() => ChatMessage, {
    filter: (payload, variables) => {
      return payload.messageSent.roomId === variables.roomId;
    },
  })
  messageSent(@Args('roomId') roomId: string) {
    return pubSub.asyncIterator(`messageSent.${roomId}`);
  }

  @Subscription(() => ChatRoom)
  chatRoomUpdated() {
    return pubSub.asyncIterator('chatRoomUpdated');
  }

  @Subscription(() => ChatNotification, {
    filter: (payload, variables) => {
      return payload.chatNotification.userId === variables.memberId;
    },
  })
  chatNotification(@Args('memberId') memberId: string) {
    return pubSub.asyncIterator(`chatNotification.${memberId}`);
  }

  @Subscription(() => TypingIndicator, {
    filter: (payload, variables) => {
      return payload.typingIndicator.roomId === variables.roomId;
    },
  })
  typingIndicator(@Args('roomId') roomId: string) {
    return pubSub.asyncIterator(`typingIndicator.${roomId}`);
  }

  @Mutation(() => ChatMessage)
  async sendMessage(@Args('input') input: SendMessageInput) {
    const message = await this.chatService.sendMessage(input);
    
    // 해당 채팅방에 메시지 발행
    pubSub.publish(`messageSent.${input.roomId}`, {
      messageSent: message,
    });
    
    // 채팅방 업데이트 발행
    const updatedRoom = await this.chatService.updateChatRoom(input.roomId);
    pubSub.publish('chatRoomUpdated', {
      chatRoomUpdated: updatedRoom,
    });
    
    // 알림 발행
    const notification = await this.chatService.createNotification({
      type: 'MESSAGE',
      title: '새 메시지',
      roomId: input.roomId,
      messageId: message._id,
      senderId: message.senderId,
      content: message.content,
      userId: updatedRoom.userId,
    });
    
    pubSub.publish(`chatNotification.${updatedRoom.userId}`, {
      chatNotification: notification,
    });
    
    return message;
  }
}
```

## 2. 프론트엔드 설정 (Next.js + Apollo Client)

### 2.1 Apollo Client 설정

```typescript
// apollo/client.ts
import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const getWsUrl = () => {
  const baseWsUrl = process.env.NEXT_PUBLIC_API_WS || 'ws://localhost:3000';
  return baseWsUrl.endsWith('/graphql') ? baseWsUrl : `${baseWsUrl}/graphql`;
};

// HTTP 링크
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_GRAPHQL_URL || 'http://localhost:3000/graphql',
  credentials: 'include',
});

// WebSocket 링크
const wsLink = new GraphQLWsLink(
  createClient({
    url: getWsUrl(),
    connectionParams: {
      authToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
    },
  })
);

// HTTP와 WebSocket 분리
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

// Apollo Client 생성
export function createApolloClient() {
  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache({
      typePolicies: {
        Subscription: {
          fields: {
            messageSent: {
              merge(existing = [], incoming) {
                return incoming;
              },
            },
            chatRoomUpdated: {
              merge(existing = [], incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
  });
}
```

### 2.2 Subscription 정의

```typescript
// apollo/user/subscription.ts
import { gql } from '@apollo/client';

export const MESSAGE_SENT = gql`
  subscription MessageSent($roomId: String!) {
    messageSent(roomId: $roomId) {
      _id
      messageId
      roomId
      senderId
      messageType
      content
      status
      senderAvatar
      senderNickname
      isAgent
      isEdited
      isDeleted
      isPinned
      isSystem
      createdAt
      updatedAt
    }
  }
`;

export const CHAT_ROOM_UPDATED = gql`
  subscription OnChatRoomUpdated {
    chatRoomUpdated {
      _id
      roomId
      roomType
      userId
      agentId
      propertyId
      status
      lastMessageContent
      lastMessageSenderId
      lastMessageTime
      unreadCountForUser
      unreadCountForAgent
      propertyTitle
      userNickname
      agentNickname
      createdAt
      updatedAt
    }
  }
`;

export const CHAT_NOTIFICATION = gql`
  subscription OnChatNotification($memberId: String!) {
    chatNotification(memberId: $memberId) {
      _id
      type
      title
      roomId
      messageId
      senderId
      content
      userId
      isRead
      data
      timestamp
      createdAt
    }
  }
`;

export const GET_CHAT_ROOMS = gql`
  query GetChatRooms($input: ChatRoomQueryInput!) {
    getMyChatRooms(input: $input) {
      list {
        _id
        roomId
        roomType
        userId
        agentId
        propertyId
        status
        lastMessageContent
        lastMessageSenderId
        lastMessageTime
        unreadCountForUser
        unreadCountForAgent
        propertyTitle
        userNickname
        agentNickname
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
      totalUnreadCount
    }
  }
`;
```

### 2.3 커스텀 훅 구현

```typescript
// libs/hooks/useChatSubscriptions.ts
import { useSubscription } from '@apollo/client';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import {
  MESSAGE_SENT,
  CHAT_ROOM_UPDATED,
  CHAT_NOTIFICATION,
} from '../../apollo/user/subscription';

interface UseChatSubscriptionsOptions {
  roomId?: string;
  userId?: string;
  memberId?: string;
  onMessageSent?: (message: any) => void;
  onChatRoomUpdated?: (room: any) => void;
  onChatNotification?: (notification: any) => void;
}

export const useChatSubscriptions = (options: UseChatSubscriptionsOptions = {}) => {
  const user = useReactiveVar(userVar);
  const {
    roomId,
    userId,
    memberId,
    onMessageSent,
    onChatRoomUpdated,
    onChatNotification,
  } = options;

  const currentUserId = userId || user?._id;
  const currentMemberId = memberId || user?._id;

  // 메시지 전송 구독
  const { data: messageSentData } = useSubscription(MESSAGE_SENT, {
    variables: { roomId: roomId || '' },
    skip: !roomId || !currentUserId,
    onData: ({ data }) => {
      if (data?.data?.messageSent) {
        console.log('새 메시지 수신:', data.data.messageSent);
        onMessageSent?.(data.data.messageSent);
      }
    },
  });

  // 채팅방 업데이트 구독
  const { data: chatRoomUpdatedData } = useSubscription(CHAT_ROOM_UPDATED, {
    skip: !currentUserId,
    onData: ({ data }) => {
      if (data?.data?.chatRoomUpdated) {
        console.log('채팅방 업데이트:', data.data.chatRoomUpdated);
        onChatRoomUpdated?.(data.data.chatRoomUpdated);
      }
    },
  });

  // 채팅 알림 구독
  const { data: chatNotificationData } = useSubscription(CHAT_NOTIFICATION, {
    variables: { memberId: currentMemberId || '' },
    skip: !currentMemberId,
    onData: ({ data }) => {
      if (data?.data?.chatNotification) {
        console.log('채팅 알림 수신:', data.data.chatNotification);
        onChatNotification?.(data.data.chatNotification);
      }
    },
  });

  return {
    messageSentData,
    chatRoomUpdatedData,
    chatNotificationData,
  };
};
```

### 2.4 컴포넌트에서 사용

```typescript
// libs/components/chat/UnifiedChat.tsx
import React, { useState, useEffect } from 'react';
import { useChatSubscriptions } from '../../hooks/useChatSubscriptions';
import { ChatMessage, ChatRoom } from '../../types/chat/chat';

const UnifiedChat: React.FC<{ roomId?: string }> = ({ roomId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  // Subscription 사용
  const { onMessageSent, onChatRoomUpdated, onChatNotification } = useChatSubscriptions({
    roomId,
    onMessageSent: (message: ChatMessage) => {
      console.log('새 메시지 수신:', message);
      setMessages(prev => [...prev, message]);
    },
    onChatRoomUpdated: (room: ChatRoom) => {
      console.log('채팅방 업데이트:', room);
      setChatRooms(prev => 
        prev.map(r => r._id === room._id ? room : r)
      );
    },
    onChatNotification: (notification: any) => {
      console.log('채팅 알림 수신:', notification);
      // 알림 처리 로직
    },
  });

  return (
    <div>
      {/* 채팅 UI 구현 */}
    </div>
  );
};
```

## 3. 올바른 쿼리 사용 예시

### 3.1 채팅방 목록 조회
```typescript
// ✅ 올바른 쿼리
const GET_CHAT_ROOMS = gql`
  query GetChatRooms($input: ChatRoomQueryInput!) {
    getMyChatRooms(input: $input) {
      list {
        _id
        roomId
        roomType
        userId
        agentId
        propertyId
        status
        lastMessageContent
        lastMessageSenderId
        lastMessageTime
        unreadCountForUser
        unreadCountForAgent
        propertyTitle
        userNickname
        agentNickname
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
      totalUnreadCount
    }
  }
`;

// ✅ 올바른 변수
const variables = {
  input: {
    page: 1,
    limit: 20,
    status: "ACTIVE", // 선택사항
    roomType: "PROPERTY_INQUIRY" // 선택사항
  }
};
```

### 3.2 ChatRoomQueryInput 타입 정의
```typescript
export interface ChatRoomQueryInput {
  agentId?: string;
  status?: 'ACTIVE' | 'CLOSED' | 'PENDING';
  roomType?: string;
  page?: number;
  limit?: number;
}
```

## 4. 환경 변수 설정

```bash
# .env.local
NEXT_PUBLIC_API_GRAPHQL_URL=http://your-backend-url:3000/graphql
NEXT_PUBLIC_API_WS=ws://your-backend-url:3000
```

## 5. 테스트 방법

### 5.1 백엔드 테스트

```bash
# GraphQL Playground에서 테스트
subscription {
  chatRoomUpdated {
    _id
    roomId
    propertyTitle
    lastMessageContent
  }
}
```

### 5.2 프론트엔드 테스트

1. 브라우저 개발자 도구에서 WebSocket 연결 확인
2. 메시지 전송 후 실시간 업데이트 확인
3. 여러 탭에서 동시 접속하여 실시간 동기화 확인

## 6. 주의사항

1. **WebSocket 연결 관리**: 연결이 끊어졌을 때 자동 재연결 처리
2. **메모리 누수 방지**: 컴포넌트 언마운트 시 Subscription 정리
3. **에러 처리**: Subscription 에러 발생 시 적절한 폴백 처리
4. **성능 최적화**: 불필요한 Subscription 구독 방지

## 7. 문제 해결

### 7.1 "Cannot query field" 에러
- 백엔드에서 해당 Subscription이 정의되었는지 확인
- GraphQL Schema가 올바르게 생성되었는지 확인

### 7.2 WebSocket 연결 실패
- 환경 변수 설정 확인
- 백엔드 WebSocket 서버 실행 확인
- 방화벽 설정 확인

### 7.3 실시간 업데이트가 안됨
- Apollo Client의 split 함수 설정 확인
- Subscription 필터 조건 확인
- 백엔드에서 pubSub.publish 호출 확인
