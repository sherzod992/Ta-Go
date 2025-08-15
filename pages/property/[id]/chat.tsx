import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CHAT_ROOM, GET_CHAT_MESSAGES, CHECK_CHAT_ROOM_EXISTS, GET_ALL_USER_CHAT_ROOMS } from '../../../apollo/user/query';
import { CREATE_CHAT_ROOM, SEND_MESSAGE, MARK_AS_READ } from '../../../apollo/user/mutation';
import { ChatMessage, ChatRoom } from '../../../libs/types/chat/chat';
import { CreateChatRoomInput, SendMessageInput } from '../../../libs/types/chat/chat.input';
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
	const [isInitializing, setIsInitializing] = useState(true);
	
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	// 사용자 ID (실제로는 인증된 사용자에서 가져와야 함)
	const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

	// 채팅방 생성
	const [createChatRoom, { loading: creatingChat }] = useMutation(CREATE_CHAT_ROOM, {
		onError: (error) => {
			console.error('채팅방 생성 에러:', error);
			sweetErrorAlert('채팅방 생성에 실패했습니다.');
		}
	});

	// 사용자의 모든 채팅방 조회 (디버깅용)
	const { data: userChatRoomsData } = useQuery(GET_ALL_USER_CHAT_ROOMS, {
		variables: { userId: userId || '' },
		skip: !userId,
		onError: (error) => {
			console.error('사용자 채팅방 조회 에러:', error);
		}
	});

	// 채팅방 존재 여부 확인
	const { data: chatRoomExistsData, refetch: refetchChatRoomExists } = useQuery(CHECK_CHAT_ROOM_EXISTS, {
		variables: { roomId: chatId || '' },
		skip: !chatId,
		onError: (error) => {
			console.error('채팅방 존재 확인 에러:', error);
		}
	});

	// 채팅방 정보 조회
	const { data: chatRoomData, loading: loadingChatRoom, error: chatRoomError, refetch: refetchChatRoom } = useQuery(GET_CHAT_ROOM, {
		variables: { roomId: chatId },
		skip: !chatId,
		pollInterval: 5000,
		onError: (error) => {
			console.error('채팅방 조회 에러:', error);
			// 백엔드 개선 사항에 따라 더 구체적인 에러 처리
			if (error.message.includes('채팅방을 찾을 수 없습니다') || 
				error.message.includes('not found') ||
				error.message.includes('Chat room not found')) {
				console.log('채팅방이 존재하지 않습니다. 새로 생성합니다.');
				handleCreateNewChatRoom();
			} else if (error.message.includes('권한이 없습니다') || 
					   error.message.includes('permission denied') ||
					   error.message.includes('Unauthorized')) {
				console.log('채팅방 접근 권한이 없습니다.');
				sweetErrorAlert('이 채팅방에 접근할 권한이 없습니다.');
			} else {
				console.error('알 수 없는 채팅방 에러:', error);
				sweetErrorAlert('채팅방 정보를 불러오는데 실패했습니다.');
			}
		}
	});

	// 메시지 조회
	const { data: messagesData, loading: loadingMessages, error: messagesError, refetch: refetchMessages } = useQuery(GET_CHAT_MESSAGES, {
		variables: { 
			input: { 
				roomId: chatId || '', 
				page: 1, 
				limit: 50 
			} 
		},
		skip: !chatId,
		pollInterval: 3000,
		onError: (error) => {
			console.error('메시지 조회 에러:', error);
			// 백엔드 개선 사항에 따라 더 구체적인 에러 처리
			if (error.message.includes('채팅방을 찾을 수 없습니다') || 
				error.message.includes('not found') ||
				error.message.includes('Chat room not found')) {
				console.log('메시지 조회 시 채팅방이 존재하지 않습니다.');
				handleCreateNewChatRoom();
			} else if (error.message.includes('권한이 없습니다') || 
					   error.message.includes('permission denied') ||
					   error.message.includes('Unauthorized')) {
				console.log('메시지 조회 권한이 없습니다.');
				sweetErrorAlert('메시지를 조회할 권한이 없습니다.');
			} else {
				console.error('알 수 없는 메시지 조회 에러:', error);
				sweetErrorAlert('메시지를 불러오는데 실패했습니다.');
			}
		}
	});

	// 메시지 전송
	const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
		onError: (error) => {
			console.error('메시지 전송 에러:', error);
			sweetErrorAlert('메시지 전송에 실패했습니다.');
			setIsTyping(false);
		}
	});

	// 메시지 읽음 처리
	const [markAsRead] = useMutation(MARK_AS_READ, {
		onError: (error) => {
			console.error('메시지 읽음 처리 에러:', error);
		}
	});

	// 새로운 채팅방 생성 처리
	const handleCreateNewChatRoom = async () => {
		if (!propertyId || !userId) {
			console.error('매물 ID 또는 사용자 ID가 없습니다.');
			return;
		}

		try {
			console.log('새 채팅방 생성 시작:', { propertyId, userId });
			
			const result = await createChatRoom({
				variables: {
					input: {
						roomType: 'PROPERTY_INQUIRY',
						propertyId: propertyId as string,
						userId: userId
					} as CreateChatRoomInput
				}
			});

			if (result.data?.createChatRoom) {
				const newRoomId = result.data.createChatRoom.roomId;
				console.log('채팅방 생성 성공:', newRoomId);
				setChatId(newRoomId);
				
				// 초기 메시지 추가
				const initialMessage: ChatMessage = {
					_id: 'welcome',
					messageId: 'welcome',
					roomId: newRoomId,
					content: '안녕하세요! 이 매물에 대해 궁금한 점이 있으시면 언제든 말씀해 주세요.',
					senderId: 'system',
					messageType: 'SYSTEM',
					status: 'SENT',
					senderNickname: '시스템',
					isAgent: false,
					isEdited: false,
					isDeleted: false,
					isPinned: false,
					isSystem: true,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				};
				setMessages([initialMessage]);
				
				// 채팅방 존재 여부 확인 쿼리 새로고침
				await refetchChatRoomExists();
			}
		} catch (error) {
			console.error('채팅방 생성 중 에러:', error);
			sweetErrorAlert('채팅방 생성에 실패했습니다.');
		}
	};

	// 채팅방 초기화 (개선된 로직)
	useEffect(() => {
		const initializeChat = async () => {
			if (!propertyId || !userId) {
				console.log('매물 ID 또는 사용자 ID가 없어 초기화를 건너뜁니다.');
				setIsInitializing(false);
				return;
			}

			try {
				console.log('채팅 초기화 시작:', { propertyId, userId });
				
				// 사용자의 기존 채팅방 확인
				if (userChatRoomsData?.getAllUserChatRooms) {
					const existingRoom = userChatRoomsData.getAllUserChatRooms.find(
						(room: any) => room.propertyId === propertyId && room.roomType === 'PROPERTY_INQUIRY'
					);
					
					if (existingRoom) {
						console.log('기존 채팅방 발견:', existingRoom.roomId);
						setChatId(existingRoom.roomId);
						setIsInitializing(false);
						return;
					}
				}

				// 기존 채팅방이 없으면 새로 생성
				console.log('기존 채팅방이 없어 새로 생성합니다.');
				await handleCreateNewChatRoom();
				
			} catch (error) {
				console.error('채팅 초기화 에러:', error);
				sweetErrorAlert('채팅 초기화에 실패했습니다.');
			} finally {
				setIsInitializing(false);
			}
		};

		initializeChat();
	}, [propertyId, userId, userChatRoomsData]);

	// 메시지 업데이트
	useEffect(() => {
		if (messagesData?.getChatMessages?.list) {
			setMessages(messagesData.getChatMessages.list);
		}
	}, [messagesData]);

	// 자동 스크롤
	const scrollToBottom = () => {
		try {
			if (messagesEndRef.current) {
				messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
			}
		} catch (error) {
			console.error('스크롤 에러:', error);
		}
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// 채팅방 진입 시 메시지 읽음 처리
	useEffect(() => {
		if (chatId && messages.length > 0) {
			markAsRead({
				variables: {
					input: {
						roomId: chatId
					}
				}
			});
		}
	}, [chatId, messages, markAsRead]);

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
			messageId: `temp-${Date.now()}`,
			roomId: chatId,
			content: inputMessage,
			senderId: userId,
			messageType: 'TEXT',
			status: 'SENDING',
			senderNickname: '나',
			isAgent: false,
			isEdited: false,
			isDeleted: false,
			isPinned: false,
			isSystem: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
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
				roomId: chatId,
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

	const formatTime = (createdAt: string) => {
		return new Date(createdAt).toLocaleTimeString('ko-KR', {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const formatDate = (createdAt: string) => {
		return new Date(createdAt).toLocaleDateString('ko-KR', {
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

	// 로딩 상태 처리
	if (isInitializing || creatingChat || loadingChatRoom || loadingMessages) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
				<CircularProgress />
				<Typography variant="h6" color="text.secondary">
					{isInitializing ? '채팅방을 초기화하는 중...' : '채팅 정보를 불러오는 중...'}
				</Typography>
			</Box>
		);
	}

	// 채팅방이 존재하지 않는 경우 처리 (개선된 에러 처리)
	if (chatRoomError && (
		chatRoomError.message.includes('채팅방을 찾을 수 없습니다') || 
		chatRoomError.message.includes('not found') ||
		chatRoomError.message.includes('Chat room not found')
	)) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
				<CircularProgress />
				<Typography variant="h6" color="text.secondary">
					채팅방을 생성하는 중...
				</Typography>
			</Box>
		);
	}

	// 권한 에러 처리
	if (chatRoomError && (
		chatRoomError.message.includes('권한이 없습니다') || 
		chatRoomError.message.includes('permission denied') ||
		chatRoomError.message.includes('Unauthorized')
	)) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
				<Typography variant="h6" color="error">
					이 채팅방에 접근할 권한이 없습니다.
				</Typography>
				<Button variant="contained" onClick={() => router.back()}>
					돌아가기
				</Button>
			</Box>
		);
	}

	const chatRoom = chatRoomData?.getChatRoom;

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
							{chatRoom?.propertyTitle || '매물 정보 로딩 중...'}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{chatRoom?.agentNickname || '담당자 미배정'}
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
						const isUser = message.senderId === userId;
						const showDate = index === 0 || 
							new Date(message.createdAt).toDateString() !== 
							new Date(messages[index - 1].createdAt).toDateString();

						return (
							<React.Fragment key={message._id}>
								{showDate && (
									<Box textAlign="center" my={2}>
										<Chip 
											label={formatDate(message.createdAt)} 
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
											{formatTime(message.createdAt)}
											{message.status === 'READ' && isUser && ' ✓'}
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
