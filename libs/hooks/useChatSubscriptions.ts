import { useEffect, useRef } from 'react';
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
} from '../../apollo/user/subscription';

interface UseChatSubscriptionsOptions {
  roomId?: string;
  onMessageSent?: (message: any) => void;
  onMessageUpdated?: (message: any) => void;
  onTypingIndicator?: (data: any) => void;
  onChatNotification?: (notification: any) => void;
  onMessageRead?: (data: any) => void;
  onChatRoomUpdated?: (room: any) => void;
}

export const useChatSubscriptions = (options: UseChatSubscriptionsOptions = {}) => {
  const user = useReactiveVar(userVar);
  const { roomId, onMessageSent, onMessageUpdated, onTypingIndicator, onChatNotification, onMessageRead, onChatRoomUpdated } = options;

  // 메시지 전송 구독
  const { data: messageSentData } = useSubscription(MESSAGE_SENT, {
    variables: { roomId: roomId || '' },
    skip: !roomId || !user?._id,
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
    skip: !roomId || !user?._id,
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
    skip: !roomId || !user?._id,
    onData: ({ data }) => {
      if (data?.data?.typingIndicator) {
        console.log('GraphQL Subscription - 타이핑 상태:', data.data.typingIndicator);
        onTypingIndicator?.(data.data.typingIndicator);
      }
    },
  });

  // 채팅 알림 구독
  const { data: chatNotificationData } = useSubscription(CHAT_NOTIFICATION, {
    skip: !user?._id,
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
    skip: !roomId || !user?._id,
    onData: ({ data }) => {
      if (data?.data?.messageRead) {
        console.log('GraphQL Subscription - 메시지 읽음:', data.data.messageRead);
        onMessageRead?.(data.data.messageRead);
      }
    },
  });

  // 채팅방 업데이트 구독
  const { data: chatRoomUpdatedData } = useSubscription(CHAT_ROOM_UPDATED, {
    skip: !user?._id,
    onData: ({ data }) => {
      if (data?.data?.chatRoomUpdated) {
        console.log('GraphQL Subscription - 채팅방 업데이트:', data.data.chatRoomUpdated);
        onChatRoomUpdated?.(data.data.chatRoomUpdated);
      }
    },
  });

  return {
    messageSentData,
    messageUpdatedData,
    typingIndicatorData,
    chatNotificationData,
    messageReadData,
    chatRoomUpdatedData,
  };
};
