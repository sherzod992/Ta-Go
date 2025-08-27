import { useEffect, useRef, useCallback } from 'react';
import { useSubscription } from '@apollo/client';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import {
  MESSAGE_SENT,
  MESSAGE_UPDATED,
  TYPING_INDICATOR,
  CHAT_NOTIFICATION,
  MESSAGE_READ,
  CHAT_ROOM_UPDATED,
  ROOM_MESSAGES_SUBSCRIPTION,
  USER_CHAT_ROOMS_SUBSCRIPTION,
  CHAT_ROOM_STATUS_CHANGED,
  USER_ONLINE_STATUS,
} from '../../apollo/user/subscription';

interface UseChatSubscriptionsOptions {
  roomId?: string;
  userId?: string;
  memberId?: string;
  onMessageSent?: (message: any) => void;
  onMessageUpdated?: (message: any) => void;
  onTypingIndicator?: (data: any) => void;
  onChatNotification?: (notification: any) => void;
  onMessageRead?: (data: any) => void;
  onChatRoomUpdated?: (room: any) => void;
  onRoomMessages?: (messages: any[]) => void;
  onUserChatRooms?: (rooms: any[]) => void;
  onChatRoomStatusChanged?: (room: any) => void;
  onUserOnlineStatus?: (status: any) => void;
}

export const useChatSubscriptions = (options: UseChatSubscriptionsOptions = {}) => {
  const user = useReactiveVar(userVar);
  const {
    roomId,
    userId,
    memberId,
    onMessageSent,
    onMessageUpdated,
    onTypingIndicator,
    onChatNotification,
    onMessageRead,
    onChatRoomUpdated,
    onRoomMessages,
    onUserChatRooms,
    onChatRoomStatusChanged,
    onUserOnlineStatus,
  } = options;

  // 사용자 ID 결정 (옵션에서 제공되거나 전역 상태에서 가져옴)
  const currentUserId = userId || user?._id;
  const currentMemberId = memberId || user?._id;

  // 메시지 전송 구독
  const { data: messageSentData } = useSubscription(MESSAGE_SENT, {
    variables: { roomId: roomId || '' },
    skip: !roomId || !currentUserId,
    onData: ({ data }) => {
      if (data?.data?.messageSent) {
        console.log('GraphQL Subscription - 새 메시지:', data.data.messageSent);
        onMessageSent?.(data.data.messageSent);
      }
    },
  });

  // 메시지 업데이트 구독
  const { data: messageUpdatedData } = useSubscription(MESSAGE_UPDATED, {
    variables: { roomId: roomId || '' },
    skip: !roomId || !currentUserId,
    onData: ({ data }) => {
      if (data?.data?.messageUpdated) {
        console.log('GraphQL Subscription - 메시지 업데이트:', data.data.messageUpdated);
        onMessageUpdated?.(data.data.messageUpdated);
      }
    },
  });

  // 타이핑 상태 구독
  const { data: typingIndicatorData } = useSubscription(TYPING_INDICATOR, {
    variables: { roomId: roomId || '' },
    skip: !roomId || !currentUserId,
    onData: ({ data }) => {
      if (data?.data?.typingIndicator) {
        console.log('GraphQL Subscription - 타이핑 상태:', data.data.typingIndicator);
        onTypingIndicator?.(data.data.typingIndicator);
      }
    },
  });

  // 채팅 알림 구독 (업데이트된 버전)
  const { data: chatNotificationData } = useSubscription(CHAT_NOTIFICATION, {
    variables: { memberId: currentMemberId || '' },
    skip: !currentMemberId,
    onData: ({ data }) => {
      if (data?.data?.chatNotification) {
        console.log('GraphQL Subscription - 채팅 알림:', data.data.chatNotification);
        onChatNotification?.(data.data.chatNotification);
      }
    },
  });

  // 메시지 읽음 처리 구독
  const { data: messageReadData } = useSubscription(MESSAGE_READ, {
    variables: { roomId: roomId || '' },
    skip: !roomId || !currentUserId,
    onData: ({ data }) => {
      if (data?.data?.messageRead) {
        console.log('GraphQL Subscription - 메시지 읽음:', data.data.messageRead);
        onMessageRead?.(data.data.messageRead);
      }
    },
  });

  // 채팅방 업데이트 구독 (업데이트된 버전)
  const { data: chatRoomUpdatedData } = useSubscription(CHAT_ROOM_UPDATED, {
    skip: !currentUserId,
    onData: ({ data }) => {
      if (data?.data?.chatRoomUpdated) {
        console.log('GraphQL Subscription - 채팅방 업데이트:', data.data.chatRoomUpdated);
        onChatRoomUpdated?.(data.data.chatRoomUpdated);
      }
    },
  });

  // 특정 채팅방의 메시지 구독
  const { data: roomMessagesData } = useSubscription(ROOM_MESSAGES_SUBSCRIPTION, {
    variables: { roomId: roomId || '' },
    skip: !roomId || !currentUserId,
    onData: ({ data }) => {
      if (data?.data?.roomMessages) {
        console.log('GraphQL Subscription - 채팅방 메시지:', data.data.roomMessages);
        onRoomMessages?.(data.data.roomMessages);
      }
    },
  });

  // 사용자별 채팅방 목록 업데이트 구독
  const { data: userChatRoomsData } = useSubscription(USER_CHAT_ROOMS_SUBSCRIPTION, {
    variables: { userId: currentUserId || '' },
    skip: !currentUserId,
    onData: ({ data }) => {
      if (data?.data?.userChatRooms) {
        console.log('GraphQL Subscription - 사용자 채팅방 목록:', data.data.userChatRooms);
        onUserChatRooms?.(data.data.userChatRooms);
      }
    },
  });

  // 채팅방 상태 변경 구독
  const { data: chatRoomStatusChangedData } = useSubscription(CHAT_ROOM_STATUS_CHANGED, {
    variables: { roomId: roomId || '' },
    skip: !roomId || !currentUserId,
    onData: ({ data }) => {
      if (data?.data?.chatRoomStatusChanged) {
        console.log('GraphQL Subscription - 채팅방 상태 변경:', data.data.chatRoomStatusChanged);
        onChatRoomStatusChanged?.(data.data.chatRoomStatusChanged);
      }
    },
  });

  // 실시간 온라인 상태 구독
  const { data: userOnlineStatusData } = useSubscription(USER_ONLINE_STATUS, {
    variables: { userId: currentUserId || '' },
    skip: !currentUserId,
    onData: ({ data }) => {
      if (data?.data?.userOnlineStatus) {
        console.log('GraphQL Subscription - 사용자 온라인 상태:', data.data.userOnlineStatus);
        onUserOnlineStatus?.(data.data.userOnlineStatus);
      }
    },
  });

  return {
    // 데이터 반환
    messageSentData,
    messageUpdatedData,
    typingIndicatorData,
    chatNotificationData,
    messageReadData,
    chatRoomUpdatedData,
    roomMessagesData,
    userChatRoomsData,
    chatRoomStatusChangedData,
    userOnlineStatusData,
    // 콜백 함수들도 반환 (옵션으로 전달된 것들)
    onMessageSent,
    onMessageUpdated,
    onTypingIndicator,
    onChatNotification,
    onMessageRead,
    onChatRoomUpdated,
    onRoomMessages,
    onUserChatRooms,
    onChatRoomStatusChanged,
    onUserOnlineStatus,
  };
};
