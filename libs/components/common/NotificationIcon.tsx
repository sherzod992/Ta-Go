import React, { useEffect, useState } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_UNREAD_MESSAGE_COUNT } from '../../../apollo/user/query';
import { useRouter } from 'next/router';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { ChatBubbleOutline, ChatBubble } from '@mui/icons-material';
import { sweetErrorAlert } from '../../sweetAlert';
import { useChatNotifications } from '../../hooks/useChatNotifications';

interface NotificationIconProps {
	userId: string;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({ userId }) => {
	const router = useRouter();
	const { unreadCount, hasUnread, requestNotificationPermission } = useChatNotifications({ userId });

	useEffect(() => {
		// 컴포넌트 마운트 시 알림 권한 요청
		requestNotificationPermission();
	}, [requestNotificationPermission]);

	const handleClick = () => {
		router.push('/mypage/chat');
	};

	return (
		<Tooltip title={hasUnread ? `${unreadCount}개의 읽지 않은 메시지` : '채팅'}>
			<IconButton
				onClick={handleClick}
				color="inherit"
				sx={{
					position: 'relative',
					'&:hover': {
						backgroundColor: 'rgba(255, 255, 255, 0.1)',
					},
				}}
			>
				<Badge
					badgeContent={hasUnread ? unreadCount : 0}
					color="error"
					max={99}
					sx={{
						'& .MuiBadge-badge': {
							fontSize: '0.75rem',
							minWidth: '20px',
							height: '20px',
							borderRadius: '10px',
						},
					}}
				>
					{hasUnread ? (
						<ChatBubble sx={{ fontSize: 24 }} />
					) : (
						<ChatBubbleOutline sx={{ fontSize: 24 }} />
					)}
				</Badge>
			</IconButton>
		</Tooltip>
	);
};
