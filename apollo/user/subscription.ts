import { gql } from '@apollo/client';

/**************************
 *         CHAT SUBSCRIPTIONS        *
 *************************/

// 메시지 전송 구독
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

// 메시지 업데이트 구독
export const MESSAGE_UPDATED = gql`
  subscription MessageUpdated($roomId: String!) {
    messageUpdated(roomId: $roomId) {
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

// 타이핑 상태 구독
export const TYPING_INDICATOR = gql`
  subscription TypingIndicator($roomId: String!) {
    typingIndicator(roomId: $roomId) {
      roomId
      userId
      userNickname
      isTyping
      timestamp
    }
  }
`;

// 채팅 알림 구독 (업데이트된 버전)
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

// 메시지 읽음 처리 구독
export const MESSAGE_READ = gql`
  subscription MessageRead($roomId: String!) {
    messageRead(roomId: $roomId) {
      roomId
      userId
      messageIds
      timestamp
    }
  }
`;

// 채팅방 업데이트 구독 (업데이트된 버전)
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

// 특정 채팅방의 메시지 구독
export const ROOM_MESSAGES_SUBSCRIPTION = gql`
  subscription OnRoomMessages($roomId: String!) {
    roomMessages(roomId: $roomId) {
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

// 사용자별 채팅방 목록 업데이트 구독
export const USER_CHAT_ROOMS_SUBSCRIPTION = gql`
  subscription OnUserChatRooms($userId: String!) {
    userChatRooms(userId: $userId) {
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

// 채팅방 상태 변경 구독
export const CHAT_ROOM_STATUS_CHANGED = gql`
  subscription OnChatRoomStatusChanged($roomId: String!) {
    chatRoomStatusChanged(roomId: $roomId) {
      _id
      roomId
      status
      updatedAt
    }
  }
`;

// 실시간 온라인 상태 구독
export const USER_ONLINE_STATUS = gql`
  subscription OnUserOnlineStatus($userId: String!) {
    userOnlineStatus(userId: $userId) {
      userId
      isOnline
      lastSeen
      status
    }
  }
`;
