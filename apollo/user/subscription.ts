import { gql } from '@apollo/client';

/**************************
 *         CHAT SUBSCRIPTIONS        *
 *************************/

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

export const CHAT_NOTIFICATION = gql`
  subscription ChatNotification {
    chatNotification {
      _id
      type
      title
      content
      data
      userId
      isRead
      createdAt
    }
  }
`;

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

export const CHAT_ROOM_UPDATED = gql`
  subscription ChatRoomUpdated {
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
