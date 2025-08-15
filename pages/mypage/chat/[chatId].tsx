import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CHAT_ROOM, GET_CHAT_MESSAGES } from '../../../apollo/user/query';
import { SEND_MESSAGE, MARK_AS_READ } from '../../../apollo/user/mutation';
import { ChatMessage, ChatRoom } from '../../../libs/types/chat/chat';
import { SendMessageInput } from '../../../libs/types/chat/chat.input';
import { sweetErrorAlert } from '../../../libs/sweetAlert';
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
	Dialog, 
	DialogTitle, 
	DialogContent,
	Fade,
	Fab,
	Tooltip,
	Divider
} from '@mui/material';
import { 
	Send, 
	ArrowBack, 
	AttachFile, 
	Info,
	KeyboardArrowDown,
	ChatBubble,
	Business
} from '@mui/icons-material';

const ChatRoomPage: React.FC = () => {
	const router = useRouter();
	const { chatId } = router.query;
	const { isMobile } = useDeviceDetect();
	
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [inputMessage, setInputMessage] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [showPropertyDialog, setShowPropertyDialog] = useState(false);
	const [showScrollToBottom, setShowScrollToBottom] = useState(false);
	
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);

	// 사용자 ID (실제로는 인증된 사용자에서 가져와야 함)
	const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

	// 채팅방 정보 조회
	const { data: chatRoomData, loading: loadingChatRoom, error: chatRoomError } = useQuery(GET_CHAT_ROOM, {
		variables: { roomId: chatId },
		skip: !chatId,
		pollInterval: 5000,
		onError: (error) => {
			console.error('Chat room error:', error);
			if (error.message.includes('채팅방을 찾을 수 없습니다') || error.message.includes('not found')) {
				console.log('채팅방이 존재하지 않습니다.');
			} else {
				sweetErrorAlert('채팅방 정보를 불러오는데 실패했습니다.');
			}
		}
	});

	// 메시지 조회
	const { data: messagesData, loading: loadingMessages, error: messagesError } = useQuery(GET_CHAT_MESSAGES, {
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
			console.error('Messages error:', error);
			if (error.message.includes('채팅방을 찾을 수 없습니다') || error.message.includes('not found')) {
				console.log('채팅방이 존재하지 않습니다.');
			} else {
				sweetErrorAlert('메시지를 불러오는데 실패했습니다.');
			}
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
	const [markAsRead] = useMutation(MARK_AS_READ, {
		onError: (error) => {
			console.error('Mark messages as read error:', error);
		}
	});

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
			console.error('Scroll to bottom error:', error);
		}
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// 스크롤 위치 감지
	useEffect(() => {
		const container = messagesContainerRef.current;
		if (!container) return;

		const handleScroll = () => {
			try {
				if (!container || !container.scrollTop) return;
				const { scrollTop, scrollHeight, clientHeight } = container;
				const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
				setShowScrollToBottom(!isNearBottom);
			} catch (error) {
				console.error('Scroll handler error:', error);
			}
		};

		// 약간의 지연을 두어 DOM이 완전히 렌더링된 후 이벤트 리스너 추가
		const timeoutId = setTimeout(() => {
			if (container) {
				container.addEventListener('scroll', handleScroll);
			}
		}, 100);

		return () => {
			clearTimeout(timeoutId);
			if (container) {
				container.removeEventListener('scroll', handleScroll);
			}
		};
	}, []);

	// 채팅방 진입 시 메시지 읽음 처리
	useEffect(() => {
		if (chatId && messages.length > 0) {
			markAsRead({
				variables: {
					input: {
						roomId: chatId as string
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
			roomId: chatId as string,
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
			await sendMessage({
				variables: {
					input: {
						roomId: chatId as string,
						content: inputMessage
					} as SendMessageInput
				}
			});
		} catch (error) {
			// 에러 시 임시 메시지 제거
			setMessages(prev => prev.filter(msg => msg._id !== userMessage._id));
		} finally {
			setIsTyping(false);
		}
	};

	const formatTime = (createdAt: string) => {
		const date = new Date(createdAt);
		return date.toLocaleTimeString('ko-KR', { 
			hour: '2-digit', 
			minute: '2-digit' 
		});
	};

	// 채팅방이 존재하지 않는 경우 처리
	if (chatRoomError && (chatRoomError.message.includes('채팅방을 찾을 수 없습니다') || chatRoomError.message.includes('not found'))) {
		return (
			<Box 
				display="flex" 
				justifyContent="center" 
				alignItems="center" 
				minHeight="400px"
				flexDirection="column"
				gap={2}
			>
				<CircularProgress size={60} thickness={4} />
				<Typography variant="h6" color="text.secondary">
					채팅방이 존재하지 않습니다.
				</Typography>
				<Typography variant="body2" color="text.secondary">
					올바른 채팅방 ID를 확인해주세요.
				</Typography>
			</Box>
		);
	}

	if (loadingChatRoom || loadingMessages) {
		return (
			<Box 
				display="flex" 
				justifyContent="center" 
				alignItems="center" 
				minHeight="400px"
				flexDirection="column"
				gap={2}
			>
				<CircularProgress size={60} thickness={4} />
				<Typography variant="h6" color="text.secondary">
					채팅방을 불러오는 중...
				</Typography>
			</Box>
		);
	}

	const chatRoom = chatRoomData?.getChatRoom;

	return (
		<Box sx={{ 
			height: '100vh',
			display: 'flex',
			flexDirection: 'column',
			background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
		}}>
			{/* 헤더 */}
			<Paper 
				elevation={8} 
				sx={{ 
					borderRadius: 0,
					background: 'rgba(255, 255, 255, 0.95)',
					backdropFilter: 'blur(10px)',
					borderBottom: '1px solid rgba(0,0,0,0.1)'
				}}
			>
				<Box sx={{ 
					p: 2, 
					display: 'flex', 
					alignItems: 'center', 
					gap: 2 
				}}>
					<IconButton 
						onClick={() => router.back()}
						sx={{ 
							bgcolor: 'primary.main', 
							color: 'white',
							'&:hover': { bgcolor: 'primary.dark' }
						}}
					>
						<ArrowBack />
					</IconButton>

					<Avatar
						src={chatRoom?.propertyData?.propertyImages?.[0]}
						alt={chatRoom?.propertyData?.propertyTitle}
						sx={{ width: 48, height: 48 }}
					>
						<Business />
					</Avatar>

					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography variant="h6" fontWeight="bold" noWrap>
							{chatRoom?.propertyData?.propertyTitle}
						</Typography>
						<Typography variant="body2" color="text.secondary" noWrap>
							{chatRoom?.agentData?.memberFullName || '담당자 미배정'}
						</Typography>
					</Box>

					<Tooltip title="매물 정보">
						<IconButton 
							onClick={() => setShowPropertyDialog(true)}
							sx={{ color: 'primary.main' }}
						>
							<Info />
						</IconButton>
					</Tooltip>
				</Box>
			</Paper>

			{/* 메시지 영역 */}
			<Box 
				ref={messagesContainerRef}
				sx={{ 
					flex: 1, 
					overflowY: 'auto',
					p: 2,
					background: 'rgba(255, 255, 255, 0.95)',
					backdropFilter: 'blur(10px)'
				}}
			>
				{messages.length === 0 ? (
					<Box 
						display="flex" 
						justifyContent="center" 
						alignItems="center" 
						height="100%"
						flexDirection="column"
						gap={2}
					>
						<ChatBubble sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />
						<Typography variant="h6" color="text.secondary" fontWeight="bold">
							아직 메시지가 없습니다
						</Typography>
						<Typography variant="body2" color="text.secondary">
							첫 메시지를 보내보세요!
						</Typography>
					</Box>
				) : (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						{					messages.map((message, index) => {
						const isMyMessage = message.senderId === userId;
						
						return (
							<Fade in={true} timeout={300 + index * 50} key={message._id}>
									<Box sx={{ 
										display: 'flex', 
										justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
										mb: 1
									}}>
										<Box sx={{ maxWidth: '70%' }}>
											<Paper
												elevation={2}
												sx={{
													p: 2,
													borderRadius: 3,
													background: isMyMessage 
														? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
														: '#f8f9fa',
													color: isMyMessage ? 'white' : 'text.primary',
													border: isMyMessage ? 'none' : '1px solid #e9ecef',
													'&:hover': {
														boxShadow: 4
													}
												}}
											>
												<Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
													{message.content}
												</Typography>
												
												<Box sx={{ 
													display: 'flex', 
													alignItems: 'center', 
													gap: 0.5, 
													mt: 1,
													justifyContent: 'flex-end'
												}}>
													<Typography variant="caption" sx={{ opacity: 0.7 }}>
														{formatTime(message.createdAt)}
													</Typography>
													{isMyMessage && (
														<Box sx={{ display: 'flex', alignItems: 'center' }}>
															{message.status === 'READ' ? (
																<Box sx={{ 
																	width: 12, 
																	height: 12, 
																	borderRadius: '50%',
																	bgcolor: 'rgba(255,255,255,0.8)',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	fontSize: '8px'
																}}>
																	✓✓
																</Box>
															) : (
																<Box sx={{ 
																	width: 12, 
																	height: 12, 
																	borderRadius: '50%',
																	bgcolor: 'rgba(255,255,255,0.5)',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	fontSize: '8px'
																}}>
																	✓
																</Box>
															)}
														</Box>
													)}
												</Box>
											</Paper>
										</Box>
									</Box>
								</Fade>
							);
						})}
						<div ref={messagesEndRef} />
					</Box>
				)}
			</Box>

			{/* 입력 영역 */}
			<Paper 
				elevation={8} 
				sx={{ 
					borderRadius: 0,
					background: 'rgba(255, 255, 255, 0.95)',
					backdropFilter: 'blur(10px)',
					borderTop: '1px solid rgba(0,0,0,0.1)'
				}}
			>
				<Box sx={{ p: 2, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
					<Tooltip title="파일 첨부">
						<IconButton 
							sx={{ 
								bgcolor: 'primary.main', 
								color: 'white',
								'&:hover': { bgcolor: 'primary.dark' }
							}}
						>
							<AttachFile />
						</IconButton>
					</Tooltip>
					
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
						disabled={sendingMessage}
						sx={{
							'& .MuiOutlinedInput-root': {
								borderRadius: 3,
								'&:hover fieldset': {
									borderColor: 'primary.main',
								},
								'&.Mui-focused fieldset': {
									borderColor: 'primary.main',
								},
							},
						}}
					/>
					
					<Tooltip title="전송">
						<IconButton 
							onClick={handleSendMessage}
							disabled={!inputMessage.trim() || sendingMessage}
							sx={{ 
								bgcolor: inputMessage.trim() ? 'primary.main' : 'grey.300', 
								color: 'white',
								'&:hover': { 
									bgcolor: inputMessage.trim() ? 'primary.dark' : 'grey.400' 
								},
								'&:disabled': {
									bgcolor: 'grey.300',
									color: 'grey.500'
								}
							}}
						>
							{sendingMessage ? <CircularProgress size={20} color="inherit" /> : <Send />}
						</IconButton>
					</Tooltip>
				</Box>
			</Paper>

			{/* 스크롤 버튼 */}
			{showScrollToBottom && (
				<Fade in={showScrollToBottom}>
					<Fab
						color="primary"
						size="small"
						onClick={scrollToBottom}
						sx={{
							position: 'fixed',
							bottom: 100,
							right: 20,
							zIndex: 1000
						}}
					>
						<KeyboardArrowDown />
					</Fab>
				</Fade>
			)}

			{/* 매물 정보 다이얼로그 */}
			<Dialog 
				open={showPropertyDialog} 
				onClose={() => setShowPropertyDialog(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle sx={{ 
					background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					color: 'white'
				}}>
					매물 정보
				</DialogTitle>
				<DialogContent sx={{ p: 3 }}>
					{chatRoom?.propertyData && (
						<Box>
							<Typography variant="h6" gutterBottom fontWeight="bold">
								{chatRoom.propertyData.propertyTitle}
							</Typography>
							<Typography variant="body1" color="primary" fontWeight="bold" gutterBottom>
								{chatRoom.propertyData.propertyPrice?.toLocaleString()}원
							</Typography>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								{chatRoom.propertyData.propertyBrand} {chatRoom.propertyData.propertyModel}
							</Typography>
						</Box>
					)}
				</DialogContent>
			</Dialog>
		</Box>
	);
};

export default LayoutBasic(ChatRoomPage);
