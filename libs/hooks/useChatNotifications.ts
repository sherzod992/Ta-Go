import { useEffect, useState } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_UNREAD_MESSAGE_COUNT } from '../../apollo/user/query';

interface UseChatNotificationsProps {
	userId: string;
	enabled?: boolean;
}

export const useChatNotifications = ({ userId, enabled = true }: UseChatNotificationsProps) => {
	const [unreadCount, setUnreadCount] = useState(0);
	const [lastNotification, setLastNotification] = useState<Date | null>(null);

	// 읽지 않은 메시지 카운트 조회
	const { data: countData, refetch } = useQuery(GET_UNREAD_MESSAGE_COUNT, {
		skip: !enabled || !userId,
		pollInterval: 10000, // 10초마다 폴링
		onError: (error) => {
			console.error('Unread count error:', error);
		}
	});

	// 실시간 메시지 구독 (백엔드에서 구현된 경우)
	// const { data: subscriptionData } = useSubscription(UNREAD_COUNT_SUBSCRIPTION, {
	// 	variables: { userId },
	// 	skip: !enabled || !userId,
	// 	onData: ({ data }) => {
	// 		if (data?.data?.unreadCountUpdate) {
	// 			const newCount = data.data.unreadCountUpdate.totalUnreadCount;
	// 			if (newCount > unreadCount) {
	// 				// 새 메시지가 도착한 경우 알림 표시
	// 				showNotification(newCount - unreadCount);
	// 			}
	// 			setUnreadCount(newCount);
	// 		}
	// 	}
	// });

	useEffect(() => {
		if (countData?.getUnreadMessageCount !== undefined) {
			const newCount = countData.getUnreadMessageCount;
			if (newCount > unreadCount && unreadCount > 0) {
				// 새 메시지가 도착한 경우 알림 표시
				showNotification(newCount - unreadCount);
			}
			setUnreadCount(newCount);
		}
	}, [countData, unreadCount]);

	// 브라우저 알림 표시
	const showNotification = (count: number) => {
		if (!('Notification' in window)) return;

		if (Notification.permission === 'granted') {
			new Notification('새 메시지', {
				body: `${count}개의 새 메시지가 도착했습니다.`,
				icon: '/favicon.ico',
				tag: 'chat-notification'
			});
		} else if (Notification.permission !== 'denied') {
			Notification.requestPermission().then((permission) => {
				if (permission === 'granted') {
					new Notification('새 메시지', {
						body: `${count}개의 새 메시지가 도착했습니다.`,
						icon: '/favicon.ico',
						tag: 'chat-notification'
					});
				}
			});
		}

		setLastNotification(new Date());
	};

	// 알림 권한 요청
	const requestNotificationPermission = () => {
		if (!('Notification' in window)) return Promise.resolve(false);

		if (Notification.permission === 'granted') {
			return Promise.resolve(true);
		}

		return Notification.requestPermission().then((permission) => {
			return permission === 'granted';
		});
	};

	// 수동으로 카운트 새로고침
	const refreshCount = () => {
		refetch();
	};

	return {
		unreadCount,
		lastNotification,
		requestNotificationPermission,
		refreshCount,
		hasUnread: unreadCount > 0
	};
};
