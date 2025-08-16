import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';

interface ChatMessage {
	_id: string;
	messageId: string;
	roomId: string;
	content: string;
	senderId: string;
	messageType: string;
	status: string;
	senderNickname: string;
	isAgent: boolean;
	isEdited: boolean;
	isDeleted: boolean;
	isPinned: boolean;
	isSystem: boolean;
	createdAt: string;
	updatedAt: string;
}

interface ChatProps {
	messages: ChatMessage[];
	currentUserId: string;
	isLoading?: boolean;
	onSendMessage?: (message: string) => void;
	className?: string;
}

const Chat: React.FC<ChatProps> = ({
	messages,
	currentUserId,
	isLoading = false,
	onSendMessage,
	className = ''
}) => {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// 자동 스크롤 함수
	const scrollToBottom = () => {
		try {
			if (messagesEndRef.current) {
				messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
			}
		} catch (error) {
			console.error('Scroll to bottom error:', error);
		}
	};

	// 메시지가 업데이트될 때마다 자동 스크롤
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// 메시지 전송 후 즉시 스크롤
	useEffect(() => {
		if (messages.length > 0) {
			setTimeout(() => {
				scrollToBottom();
			}, 100);
		}
	}, [messages.length]);

	const formatTime = (createdAt: string) => {
		return new Date(createdAt).toLocaleTimeString('ko-KR', {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	return (
		<Box 
			className={`chat-container ${className}`}
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				overflow: 'hidden'
			}}
		>
			{/* 메시지 영역 */}
			<Box 
				className="chat-messages"
				sx={{
					flex: 1,
					overflowY: 'auto',
					padding: 2,
					display: 'flex',
					flexDirection: 'column',
					gap: 1
				}}
			>
				{isLoading ? (
					<Box 
						display="flex" 
						justifyContent="center" 
						alignItems="center" 
						height="100%"
					>
						<Typography variant="body2" color="text.secondary">
							메시지를 불러오는 중...
						</Typography>
					</Box>
				) : messages.length === 0 ? (
					<Box 
						display="flex" 
						justifyContent="center" 
						alignItems="center" 
						height="100%"
						flexDirection="column"
						gap={2}
					>
						<Typography variant="h6" color="text.secondary" fontWeight="bold">
							아직 메시지가 없습니다
						</Typography>
						<Typography variant="body2" color="text.secondary">
							첫 메시지를 보내보세요!
						</Typography>
					</Box>
				) : (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						{messages.map((message, index) => {
							const isUser = String(message.senderId) === String(currentUserId);
							
							return (
								<Box
									key={message._id || index}
									sx={{
										display: 'flex',
										justifyContent: isUser ? 'flex-end' : 'flex-start',
										mb: 1,
										gap: 1,
										alignItems: 'flex-end'
									}}
								>
									{!isUser && (
										<Avatar 
											sx={{ 
												width: 32, 
												height: 32, 
												bgcolor: '#FF9500',
												fontSize: '0.8rem'
											}}
										>
											{message.senderNickname?.charAt(0) || '담'}
										</Avatar>
									)}
									
									<Box
										sx={{
											maxWidth: '70%',
											padding: '12px 16px',
											borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
											background: isUser 
												? 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)' 
												: '#f8f9fa',
											color: isUser ? 'white' : '#333',
											wordBreak: 'break-word',
											boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
											border: isUser ? 'none' : '1px solid #e9ecef'
										}}
									>
										<Typography variant="body2" sx={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
											{message.content}
										</Typography>
										<Typography variant="caption" sx={{ 
											opacity: 0.7, 
											mt: 0.5, 
											display: 'block',
											fontSize: '0.75rem'
										}}>
											{formatTime(message.createdAt)}
											{message.status === 'READ' && isUser && ' ✓'}
										</Typography>
									</Box>
								</Box>
							);
						})}
					</Box>
				)}
				<div ref={messagesEndRef} />
			</Box>
		</Box>
	);
};

export default Chat;
