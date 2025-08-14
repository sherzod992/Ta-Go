import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CHAT_ROOM, GET_CHAT_MESSAGES } from '../../../apollo/user/query';
import { CREATE_CHAT_ROOM, SEND_MESSAGE, MARK_MESSAGES_AS_READ } from '../../../apollo/user/mutation';
import { ChatMessage, ChatRoom } from '../../../libs/types/chat/chat';
import { CreateChatRoomInput, SendMessageInput, MarkMessagesReadInput } from '../../../libs/types/chat/chat.input';
import { sweetErrorAlert, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import useDeviceDetect from '../../../libs/hooks/useDeviceDetect';
import LayoutBasic from '../../../libs/components/layout/LayoutBasic';
import { 
	Box, 
	Typography, 
	TextField, 
	IconButton, 
	Avatar, 
	Chip,
	CircularProgress,
	Paper,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	Card,
	CardContent,
	CardMedia
} from '@mui/material';
import { 
	Send, 
	ArrowBack, 
	MoreVert, 
	AttachFile,
	Close
} from '@mui/icons-material';

const PropertyChatPage: React.FC = () => {
	const router = useRouter();
	const { id: propertyId } = router.query;
	const { isMobile } = useDeviceDetect();
	
	const [chatId, setChatId] = useState<string | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [inputMessage, setInputMessage] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [showPropertyDialog, setShowPropertyDialog] = useState(false);
	
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	// 사용자 ID (실제로는 인증된 사용자에서 가져와야 함)
	const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

	// 채팅방 생성
	const [createChatRoom, { loading: creatingChat }] = useMutation(CREATE_CHAT_ROOM, {
		onError: (error) => {
			sweetErrorAlert('채팅방 생성에 실패했습니다.');
		}
	});

	// 채팅방 정보 조회
	const { data: chatRoomData, loading: loadingChatRoom } = useQuery(GET_CHAT_ROOM, {
		variables: { input: chatId },
		skip: !chatId,
		pollInterval: 5000,
		onError: (error) => {
			sweetErrorAlert('채팅방 정보를 불러오는데 실패했습니다.');
		}
	});

	// 메시지 조회
	const { data: messagesData, loading: loadingMessages } = useQuery(GET_CHAT_MESSAGES, {
		variables: { 
			input: { 
				chatId: chatId || '', 
				page: 1, 
				limit: 50 
			} 
		},
		skip: !chatId,
		pollInterval: 3000,
		onError: (error) => {
			sweetErrorAlert('메시지를 불러오는데 실패했습니다.');
		}
	});

	// 메시지 전송
	const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
		onError: (error) => {
			sweetErrorAlert('메시지 전송에 실패했습니다.');
			setIsTyping(false);
		}
	});

	// 메시지 읽음 처리
	const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ, {
		onError: (error) => {
			console.error('Mark messages as read error:', error);
		}
	});

	// 채팅방 초기화
	useEffect(() => {
		const initializeChat = async () => {
			if (!propertyId || !userId || chatId) return;

			try {
				const result = await createChatRoom({
					variables: {
						input: {
							propertyId: propertyId as string,
							userId: userId || undefined
						} as CreateChatRoomInput
					}
				});

				if (result.data?.createChatRoom) {
					setChatId(result.data.createChatRoom._id);
					
					// 초기 메시지 추가
					const initialMessage: ChatMessage = {
						_id: 'welcome',
						chatId: result.data.createChatRoom._id,
						senderId: 'system',
						senderType: 'AGENT',
						content: '안녕하세요! 이 매물에 대해 궁금한 점이 있으시면 언제든 말씀해 주세요.',
						timestamp: new Date().toISOString(),
						isRead: true
					};
					setMessages([initialMessage]);
				}
			} catch (error) {
				console.error('Chat initialization error:', error);
			}
		};

		initializeChat();
	}, [propertyId, userId, chatId, createChatRoom]);

	// 메시지 업데이트
	useEffect(() => {
		if (messagesData?.getChatMessages?.list) {
			setMessages(messagesData.getChatMessages.list);
		}
	}, [messagesData]);

	// 자동 스크롤
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// 채팅방 진입 시 메시지 읽음 처리
	useEffect(() => {
		if (chatId && userId && messages.length > 0) {
			markMessagesAsRead({
				variables: {
					input: {
						chatId,
						userId
					} as MarkMessagesReadInput
				}
			});
		}
	}, [chatId, userId, messages, markMessagesAsRead]);

	// 입력창 자동 높이 조절
	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputMessage(e.target.value);
		const textarea = e.target;
		textarea.style.height = 'auto';
		textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
	};

	// Enter 키로 메시지 전송
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const handleSendMessage = async () => {
		if (!inputMessage.trim() || sendingMessage || !chatId || !userId) return;

		const userMessage: ChatMessage = {
			_id: `temp-${Date.now()}`,
			chatId,
			senderId: userId,
			senderType: 'USER',
			content: inputMessage,
			timestamp: new Date().toISOString(),
			isRead: false
		};

		// 즉시 UI에 메시지 추가
		setMessages(prev => [...prev, userMessage]);
		setInputMessage('');
		setIsTyping(true);

		// 입력창 높이 초기화
		if (inputRef.current) {
			inputRef.current.style.height = 'auto';
		}

		try {
			const messageInput: SendMessageInput = {
				chatId,
				senderId: userId,
				senderType: 'USER',
				content: inputMessage
			};

			await sendMessage({
				variables: { input: messageInput }
			});

			sweetMixinSuccessAlert('메시지가 전송되었습니다!');
			setIsTyping(false);

		} catch (error) {
			setIsTyping(false);
		}
	};

	const formatTime = (timestamp: string) => {
		return new Date(timestamp).toLocaleTimeString('ko-KR', {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const formatDate = (timestamp: string) => {
		return new Date(timestamp).toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const formatPrice = (price?: number) => {
		if (!price) return '';
		return price.toLocaleString() + '원';
	};

	const quickMessages = [
		'가격 협상 가능한가요?',
		'시승 가능한가요?',
		'사고 이력 있나요?',
		'현재 위치 어디인가요?',
		'추가 사진 보여주세요'
	];

	const handleQuickMessage = (message: string) => {
		setInputMessage(message);
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	if (creatingChat || loadingChatRoom || loadingMessages) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
				<CircularProgress />
			</Box>
		);
	}

	const chatRoom = chatRoomData?.getChatRoom;
	const propertyData = chatRoom?.propertyData;
	const agentData = chatRoom?.agentData;

	return (
		<Box sx={{ maxWidth: 800, margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
			{/* 채팅 헤더 */}
			<Paper elevation={1} sx={{ p: 2, borderRadius: 0 }}>
				<Box display="flex" alignItems="center" gap={2}>
					<IconButton onClick={() => router.back()}>
						<ArrowBack />
					</IconButton>
					
					<Box flex={1} onClick={() => setShowPropertyDialog(true)} sx={{ cursor: 'pointer' }}>
						<Typography variant="h6" fontWeight="bold">
							{propertyData?.propertyTitle || '매물 정보 로딩 중...'}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{agentData?.memberFullName || '담당자 미배정'}
						</Typography>
					</Box>

					<IconButton>
						<MoreVert />
					</IconButton>
				</Box>
			</Paper>

			{/* 메시지 영역 */}
			<Box 
				flex={1} 
				overflow="auto" 
				p={2}
				sx={{ 
					background: '#f5f5f5',
					display: 'flex',
					flexDirection: 'column',
					gap: 1
				}}
			>
				{messages.length === 0 ? (
					<Box textAlign="center" py={4}>
						<Typography variant="h6" color="text.secondary">
							채팅방을 초기화하는 중...
						</Typography>
					</Box>
				) : (
					messages.map((message, index) => {
						const isUser = message.senderType === 'USER';
						const showDate = index === 0 || 
							new Date(message.timestamp).toDateString() !== 
							new Date(messages[index - 1].timestamp).toDateString();

						return (
							<React.Fragment key={message._id}>
								{showDate && (
									<Box textAlign="center" my={2}>
										<Chip 
											label={formatDate(message.timestamp)} 
											size="small" 
											variant="outlined"
										/>
									</Box>
								)}
								
								<Box 
									display="flex" 
									justifyContent={isUser ? 'flex-end' : 'flex-start'}
									mb={1}
								>
									<Box
										sx={{
											maxWidth: '70%',
											background: isUser ? '#1976d2' : 'white',
											color: isUser ? 'white' : 'text.primary',
											padding: 2,
											borderRadius: 2,
											boxShadow: 1,
											position: 'relative'
										}}
									>
										<Typography variant="body1">
											{message.content}
										</Typography>
										<Typography 
											variant="caption" 
											sx={{ 
												opacity: 0.7,
												display: 'block',
												mt: 0.5
											}}
										>
											{formatTime(message.timestamp)}
											{message.isRead && isUser && ' ✓'}
										</Typography>
									</Box>
								</Box>
							</React.Fragment>
						);
					})
				)}
				
				{isTyping && (
					<Box display="flex" justifyContent="flex-start" mb={1}>
						<Box
							sx={{
								background: 'white',
								padding: 2,
								borderRadius: 2,
								boxShadow: 1
							}}
						>
							<Typography variant="body2" color="text.secondary">
								상대방이 입력 중...
							</Typography>
						</Box>
					</Box>
				)}
				
				<div ref={messagesEndRef} />
			</Box>

			{/* 빠른 답변 */}
			<Box sx={{ p: 1, background: 'white', borderTop: '1px solid #e0e0e0' }}>
				<Box display="flex" gap={1} flexWrap="wrap">
					{quickMessages.map((message, index) => (
						<Button
							key={index}
							variant="outlined"
							size="small"
							onClick={() => handleQuickMessage(message)}
							disabled={sendingMessage || creatingChat}
							sx={{ fontSize: '0.75rem' }}
						>
							{message}
						</Button>
					))}
				</Box>
			</Box>

			{/* 입력 영역 */}
			<Paper elevation={2} sx={{ p: 2, borderRadius: 0 }}>
				<Box display="flex" gap={1} alignItems="flex-end">
					<IconButton size="small">
						<AttachFile />
					</IconButton>
					
					<TextField
						inputRef={inputRef}
						fullWidth
						multiline
						maxRows={4}
						value={inputMessage}
						onChange={handleInputChange}
						onKeyPress={handleKeyPress}
						placeholder="메시지를 입력하세요..."
						variant="outlined"
						size="small"
						disabled={sendingMessage || creatingChat}
						sx={{
							'& .MuiOutlinedInput-root': {
								borderRadius: 3,
							}
						}}
					/>
					
					<IconButton
						onClick={handleSendMessage}
						disabled={!inputMessage.trim() || sendingMessage || creatingChat}
						color="primary"
						sx={{
							background: inputMessage.trim() ? '#1976d2' : '#e0e0e0',
							color: 'white',
							'&:hover': {
								background: inputMessage.trim() ? '#1565c0' : '#e0e0e0',
							}
						}}
					>
						<Send />
					</IconButton>
				</Box>
			</Paper>
		</Box>
	);
};

export default LayoutBasic(PropertyChatPage);
