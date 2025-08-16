import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_CHAT_ROOM, GET_CHAT_MESSAGES, CHECK_CHAT_ROOM_EXISTS, GET_ALL_USER_CHAT_ROOMS, GET_PROPERTY } from '../../../apollo/user/query';
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
	const client = useApolloClient();
	
	const [chatId, setChatId] = useState<string | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [inputMessage, setInputMessage] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [showPropertyDialog, setShowPropertyDialog] = useState(false);
	const [isInitializing, setIsInitializing] = useState(true);
	const [isOwner, setIsOwner] = useState(false);
	
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

	// 매물 정보 조회
	const { data: propertyData, loading: loadingProperty } = useQuery(GET_PROPERTY, {
		variables: { input: propertyId as string },
		skip: !propertyId,
		onError: (error) => {
			console.error('매물 정보 조회 에러:', error);
			sweetErrorAlert('매물 정보를 불러오는데 실패했습니다.');
		},
		onCompleted: (data) => {
			if (data?.getProperty && userId) {
				const isPropertyOwner = data.getProperty.memberId === userId;
				setIsOwner(isPropertyOwner);
				
				if (isPropertyOwner) {
					sweetErrorAlert('자신이 올린 매물에는 채팅할 수 없습니다.');
					router.push(`/property/${propertyId}`);
				}
			}
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
		pollInterval: 10000, // 10초마다 폴링 (성능 최적화)
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
		pollInterval: 3000, // 3초마다 폴링 (성능 최적화)
		notifyOnNetworkStatusChange: false, // 네트워크 상태 변경 알림 비활성화
		fetchPolicy: 'cache-and-network',
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
		onCompleted: (data) => {
			console.log('메시지 전송 성공:', data);
			setIsTyping(false);
		},
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

	// 메시지 업데이트 (최적화)
	useEffect(() => {
		if (messagesData?.getChatMessages?.list) {
			// senderNickname이 null인 경우 기본값 제공 및 senderId 정규화
			const processedMessages = messagesData.getChatMessages.list.map((message: any) => ({
				...message,
				senderId: String(message.senderId), // senderId를 문자열로 정규화
				senderNickname: message.senderNickname || '알 수 없음'
			}));
			
			// 기존 메시지와 비교하여 실제로 변경된 경우에만 업데이트
			setMessages(prevMessages => {
				// 메시지 개수가 같고 내용이 동일하면 업데이트하지 않음
				if (prevMessages.length === processedMessages.length) {
					const hasChanges = processedMessages.some((newMsg, index) => {
						const oldMsg = prevMessages[index];
						return oldMsg._id !== newMsg._id || oldMsg.content !== newMsg.content;
					});
					
					if (!hasChanges) {
						return prevMessages; // 변경사항이 없으면 기존 상태 유지
					}
				}
				
				// 새로운 메시지가 있거나 변경사항이 있는 경우에만 업데이트
				const existingIds = new Set(prevMessages.map(msg => msg._id));
				const newMessages = processedMessages.filter(msg => !existingIds.has(msg._id));
				
				if (newMessages.length > 0) {
					console.log('새로운 메시지 추가:', newMessages.length);
					return [...prevMessages, ...newMessages];
				}
				
				return processedMessages; // 전체 메시지 목록으로 교체
			});
		}
	}, [messagesData]);

	// 자동 스크롤 (최적화)
	const scrollToBottom = useCallback(() => {
		try {
			if (messagesEndRef.current) {
				messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
			}
		} catch (error) {
			console.error('스크롤 에러:', error);
		}
	}, []);

	// 메시지 컨테이너 참조
	const messagesContainerRef = useRef<HTMLDivElement>(null);

	// 스크롤을 맨 아래로 이동
	const scrollToBottomImmediate = useCallback(() => {
		try {
			if (messagesContainerRef.current) {
				messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
			}
		} catch (error) {
			console.error('즉시 스크롤 에러:', error);
		}
	}, []);

	useEffect(() => {
		// 메시지가 추가될 때마다 스크롤을 맨 아래로
		if (messages.length > 0) {
			scrollToBottomImmediate();
		}
	}, [messages.length, scrollToBottomImmediate]);

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

	// 입력창 자동 높이 조절 (최적화)
	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputMessage(e.target.value);
		const textarea = e.target;
		textarea.style.height = 'auto';
		textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
	}, []);

	// Enter 키로 메시지 전송 (최적화)
	const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	}, []);

	const handleSendMessage = useCallback(async () => {
		if (!inputMessage.trim() || sendingMessage || !chatId || !userId) return;

		const currentMessage = inputMessage.trim();
		setInputMessage('');
		setIsTyping(true);

		// 입력창 높이 초기화
		if (inputRef.current) {
			inputRef.current.style.height = 'auto';
		}

		// 임시 메시지 생성 (즉시 UI에 표시)
		const tempMessage: ChatMessage = {
			_id: `temp-${Date.now()}`,
			messageId: `temp-${Date.now()}`,
			roomId: chatId,
			content: currentMessage,
			senderId: String(userId), // 문자열로 확실히 변환
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

		// 즉시 UI에 임시 메시지 추가
		setMessages(prev => [...prev, tempMessage]);
		
		// 메시지 추가 후 즉시 스크롤
		setTimeout(() => {
			scrollToBottomImmediate();
		}, 50);

		try {
			const messageInput: SendMessageInput = {
				roomId: chatId,
				content: currentMessage
			};

			await sendMessage({
				variables: { input: messageInput }
			});

			// 성공 시 임시 메시지를 실제 메시지로 업데이트
			setMessages(prev => 
				prev.map(msg => 
					msg._id === tempMessage._id 
						? { ...msg, status: 'SENT', _id: `sent-${Date.now()}` }
						: msg
				)
			);

			// 폴링으로 자동 업데이트되므로 수동 새로고침 제거

		} catch (error) {
			console.error('메시지 전송 실패:', error);
			// 실패 시 임시 메시지 제거
			setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
			sweetErrorAlert('메시지 전송에 실패했습니다.');
		} finally {
			setIsTyping(false);
		}
	}, [inputMessage, sendingMessage, chatId, userId, sendMessage]);

	const formatTime = useCallback((createdAt: string) => {
		return new Date(createdAt).toLocaleTimeString('ko-KR', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}, []);

	const formatDate = useCallback((createdAt: string) => {
		return new Date(createdAt).toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}, []);

	const formatPrice = useCallback((price?: number) => {
		if (!price) return '';
		return price.toLocaleString() + '원';
	}, []);

	const quickMessages = useMemo(() => [
		'가격 협상 가능한가요?',
		'시승 가능한가요?',
		'사고 이력 있나요?',
		'현재 위치 어디인가요?',
		'추가 사진 보여주세요'
	], []);

	const handleQuickMessage = useCallback((message: string) => {
		setInputMessage(message);
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	// 매물 작성자인 경우 채팅 불가
	if (isOwner) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
				<Typography variant="h6" color="error" textAlign="center">
					자신이 올린 매물에는 채팅할 수 없습니다.
				</Typography>
				<Button 
					variant="contained" 
					onClick={() => router.push(`/property/${propertyId}`)}
					sx={{ 
						background: 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)',
						'&:hover': {
							background: 'linear-gradient(135deg, #FF6B00 0%, #FF4500 100%)'
						}
					}}
				>
					매물 상세로 돌아가기
				</Button>
			</Box>
		);
	}

	// 로딩 상태 처리
	if (isInitializing || creatingChat || loadingChatRoom || loadingMessages || loadingProperty) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
				<CircularProgress sx={{ color: '#FF9500' }} />
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
		<Box sx={{ 
			maxWidth: 800, 
			margin: '0 auto', 
			height: '100vh', 
			display: 'flex', 
			flexDirection: 'column',
			background: '#f5f5f5'
		}}>
			{/* 카카오톡 스타일 헤더 */}
			<Box sx={{ 
				background: 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)',
				color: 'white',
				p: 2,
				boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
			}}>
				<Box display="flex" alignItems="center" gap={2}>
					<IconButton 
						onClick={() => router.back()}
						sx={{ color: 'white' }}
					>
						<ArrowBack />
					</IconButton>
					
					<Box flex={1} onClick={() => setShowPropertyDialog(true)} sx={{ cursor: 'pointer' }}>
						<Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
							{propertyData?.getProperty?.propertyTitle || '매물 정보 로딩 중...'}
						</Typography>
						<Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
							{chatRoom?.agentNickname || '담당자 미배정'}
						</Typography>
					</Box>

					<IconButton sx={{ color: 'white' }}>
						<MoreVert />
					</IconButton>
				</Box>
			</Box>

			{/* 메시지 영역 */}
			<Box 
				ref={messagesContainerRef}
				flex={1} 
				overflow="auto" 
				p={2}
				sx={{ 
					background: '#f5f5f5',
					display: 'flex',
					flexDirection: 'column',
					gap: 1,
					justifyContent: 'flex-end' // 메시지를 아래쪽부터 표시
				}}
			>
				{/* 매물 정보 카드 - 채팅 시작 시 표시 */}
				{propertyData?.getProperty && (
					<Box sx={{ mb: 2 }}>
						<Card sx={{ 
							borderRadius: 2,
							boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
							background: 'white'
						}}>
							<CardContent sx={{ p: 2 }}>
								<Box display="flex" gap={2}>
									{propertyData.getProperty.propertyImages && propertyData.getProperty.propertyImages.length > 0 && (
										<CardMedia
											component="img"
											image={propertyData.getProperty.propertyImages[0]}
											alt={propertyData.getProperty.propertyTitle}
											sx={{ 
												width: 80, 
												height: 80, 
												borderRadius: 1,
												objectFit: 'cover'
											}}
										/>
									)}
									<Box flex={1}>
										<Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem', mb: 0.5 }}>
											{propertyData.getProperty.propertyTitle}
										</Typography>
										<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
											{propertyData.getProperty.propertyBrand} {propertyData.getProperty.propertyModel}
										</Typography>
										<Typography variant="h6" color="#FF9500" fontWeight="bold">
											{propertyData.getProperty.propertyPrice?.toLocaleString()}원
										</Typography>
									</Box>
								</Box>
							</CardContent>
						</Card>
					</Box>
				)}

				{messages.length === 0 ? (
					<Box textAlign="center" py={4}>
						<Typography variant="h6" color="text.secondary">
							채팅방을 초기화하는 중...
						</Typography>
					</Box>
				) : (
					messages.map((message, index) => {
						// senderId 비교 시 문자열로 변환하여 비교
						const isUser = String(message.senderId) === String(userId);
						
						// 디버깅 로그 (개발 환경에서만)
						if (process.env.NODE_ENV === 'development') {
							console.log('메시지 표시:', {
								messageId: message._id,
								messageSenderId: message.senderId,
								currentUserId: userId,
								isUser: isUser,
								content: message.content.substring(0, 20) + '...'
							});
						}
						
						// 날짜 표시 로직
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
											sx={{ 
												background: 'rgba(255,255,255,0.8)',
												border: '1px solid #ddd'
											}}
										/>
									</Box>
								)}
								
								<Box 
									display="flex" 
									justifyContent={isUser ? 'flex-end' : 'flex-start'}
									mb={1}
									gap={1}
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
											maxWidth: '65%',
											background: isUser ? 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)' : 'white',
											color: isUser ? 'white' : '#333',
											padding: '12px 16px',
											borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
											boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
											position: 'relative',
											wordBreak: 'break-word'
										}}
									>
										<Typography variant="body1" sx={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
											{message.content}
										</Typography>
										<Typography 
											variant="caption" 
											sx={{ 
												opacity: 0.7,
												display: 'block',
												mt: 0.5,
												fontSize: '0.75rem'
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
					<Box display="flex" justifyContent="flex-start" mb={1} gap={1}>
						<Avatar 
							sx={{ 
								width: 32, 
								height: 32, 
								bgcolor: '#FF9500',
								fontSize: '0.8rem'
							}}
						>
							담
						</Avatar>
						<Box
							sx={{
								background: 'white',
								padding: '12px 16px',
								borderRadius: '18px 18px 18px 4px',
								boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
							}}
						>
							<Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
								상대방이 입력 중...
							</Typography>
						</Box>
					</Box>
				)}
				
				<div ref={messagesEndRef} />
			</Box>

			{/* 빠른 답변 */}
			<Box sx={{ 
				p: 1.5, 
				background: 'white', 
				borderTop: '1px solid #e0e0e0',
				boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
			}}>
				<Box display="flex" gap={1} flexWrap="wrap">
					{quickMessages.map((message, index) => (
						<Button
							key={index}
							variant="outlined"
							size="small"
							onClick={() => handleQuickMessage(message)}
							disabled={sendingMessage || creatingChat}
							sx={{ 
								fontSize: '0.75rem',
								borderColor: '#FF9500',
								color: '#FF9500',
								'&:hover': {
									borderColor: '#FF6B00',
									background: 'rgba(255,149,0,0.1)'
								}
							}}
						>
							{message}
						</Button>
					))}
				</Box>
			</Box>

			{/* 입력 영역 */}
			<Box sx={{ 
				p: 2, 
				background: 'white',
				borderTop: '1px solid #e0e0e0',
				boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
			}}>
				<Box display="flex" gap={1} alignItems="flex-end">
					<IconButton 
						size="small"
						sx={{ 
							color: '#666',
							'&:hover': { color: '#FF9500' }
						}}
					>
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
								'& fieldset': {
									borderColor: '#ddd',
								},
								'&:hover fieldset': {
									borderColor: '#FF9500',
								},
								'&.Mui-focused fieldset': {
									borderColor: '#FF9500',
								},
							}
						}}
					/>
					
					<IconButton
						onClick={handleSendMessage}
						disabled={!inputMessage.trim() || sendingMessage || creatingChat}
						sx={{
							background: inputMessage.trim() ? 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)' : '#e0e0e0',
							color: 'white',
							'&:hover': {
								background: inputMessage.trim() ? 'linear-gradient(135deg, #FF6B00 0%, #FF4500 100%)' : '#e0e0e0',
							}
						}}
					>
						<Send />
					</IconButton>
				</Box>
			</Box>
		</Box>
	);
};

export default LayoutBasic(PropertyChatPage);
