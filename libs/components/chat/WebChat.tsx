import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { CREATE_CHAT_ROOM, SEND_MESSAGE } from '../../../apollo/user/mutation';
import { GET_CHAT_MESSAGES, GET_CHAT_ROOM } from '../../../apollo/user/query';
import { ChatMessage, ChatRoom } from '../../types/chat/chat';
import { CreateChatRoomInput, SendMessageInput } from '../../types/chat/chat.input';
import { sweetMixinSuccessAlert, sweetErrorAlert } from '../../sweetAlert';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface WebChatProps {
	propertyId: string;
	propertyTitle: string;
	propertyImage?: string;
	propertyPrice?: number;
	userId: string;
	onClose: () => void;
}

export const WebChat: React.FC<WebChatProps> = ({
	propertyId,
	propertyTitle,
	propertyImage,
	propertyPrice,
	userId,
	onClose
}) => {
	const { isMobile } = useDeviceDetect();
	const [chatId, setChatId] = useState<string | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [inputMessage, setInputMessage] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const [createChatRoom, { loading: creatingChat }] = useMutation(CREATE_CHAT_ROOM);
	const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE);

	// 채팅방 생성 또는 기존 채팅방 조회
	const { data: chatRoomData, loading: loadingChatRoom } = useQuery(GET_CHAT_ROOM, {
		variables: { roomId: chatId },
		skip: !chatId,
		pollInterval: 5000 // 5초마다 새로고침
	});

	// 메시지 조회
	const { data: messagesData, loading: loadingMessages } = useQuery(GET_CHAT_MESSAGES, {
		variables: { 
			input: { 
				roomId: chatId || '', 
				page: 1, 
				limit: 50 
			} 
		},
		skip: !chatId,
		pollInterval: 3000 // 3초마다 새로고침
	});

	// 자동 스크롤
	const scrollToBottom = () => {
		try {
			const messagesContainer = document.querySelector('.chat-messages') as HTMLElement;
			if (messagesContainer) {
				// 스크롤을 맨 아래로 이동하여 최신 메시지가 오른쪽 아래에 표시되도록 함
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
				// 추가로 스크롤을 오른쪽 끝으로 이동
				messagesContainer.scrollLeft = messagesContainer.scrollWidth;
			}
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

	// 컴포넌트 마운트 시 스크롤
	useEffect(() => {
		setTimeout(() => {
			scrollToBottom();
		}, 200);
	}, []);

	// 채팅방 생성
	useEffect(() => {
		const initializeChat = async () => {
			try {
				console.log('WebChat 채팅방 생성 시작:', { propertyId, userId });
				
				const result = await createChatRoom({
					variables: {
						input: {
							roomType: 'PROPERTY_INQUIRY',
							propertyId,
							userId
						}
					}
				});

				if (result.data?.createChatRoom) {
					const newRoomId = result.data.createChatRoom.roomId;
					console.log('WebChat 채팅방 생성 성공:', newRoomId);
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
					setMessages([{ ...initialMessage }]);
				}
			} catch (error) {
				console.error('Chat initialization error:', error);
				sweetErrorAlert('채팅방 생성에 실패했습니다.');
			}
		};

		if (!chatId) {
			initializeChat();
		}
	}, [chatId, propertyId, userId, createChatRoom]);

	// 메시지 업데이트
	useEffect(() => {
		if (messagesData?.getChatMessages?.list) {
			// 배열을 안전하게 복사하여 읽기 전용 에러 방지 및 senderId 정규화
			const messagesList = Array.isArray(messagesData.getChatMessages.list) 
				? messagesData.getChatMessages.list.map((message: any) => ({
					...message,
					senderId: String(message.senderId), // senderId를 문자열로 정규화
					senderNickname: message.senderNickname || '알 수 없음'
				}))
				: [];
			setMessages(messagesList);
		}
	}, [messagesData]);

	// 입력창 자동 높이 조절
	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputMessage(e.target.value);
		const textarea = e.target;
		textarea.style.height = 'auto';
		textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
	};

	// Enter 키로 메시지 전송
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const handleSendMessage = async () => {
		if (!inputMessage.trim() || sendingMessage || !chatId) return;

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

		// 즉시 UI에 임시 메시지 추가 (안전한 배열 복사)
		setMessages(prev => {
			const newMessages = Array.isArray(prev) ? [...prev] : [];
			return [...newMessages, tempMessage];
		});

		// 메시지 추가 후 즉시 스크롤
		setTimeout(() => {
			scrollToBottom();
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
			setMessages(prev => {
				const newMessages = Array.isArray(prev) ? [...prev] : [];
				return newMessages.map(msg => 
					msg._id === tempMessage._id 
						? { ...msg, status: 'SENT', _id: `sent-${Date.now()}` }
						: msg
				);
			});

			// 에이전트 응답 시뮬레이션 (실제로는 서버에서 처리)
			setTimeout(() => {
				const agentMessage: ChatMessage = {
					_id: `agent-${Date.now()}`,
					messageId: `agent-${Date.now()}`,
					roomId: chatId,
					content: '문의해 주셔서 감사합니다! 곧 담당자가 연락드리겠습니다.',
					senderId: 'agent',
					messageType: 'TEXT',
					status: 'SENT',
					senderNickname: '담당자',
					isAgent: true,
					isEdited: false,
					isDeleted: false,
					isPinned: false,
					isSystem: false,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				};

				setMessages(prev => {
					const newMessages = Array.isArray(prev) ? [...prev] : [];
					return [...newMessages, agentMessage];
				});
				setIsTyping(false);
			}, 1500);

		} catch (error) {
			console.error('메시지 전송 실패:', error);
			// 실패 시 임시 메시지 제거
			setMessages(prev => {
				const newMessages = Array.isArray(prev) ? [...prev] : [];
				return newMessages.filter(msg => msg._id !== tempMessage._id);
			});
			sweetErrorAlert('메시지 전송에 실패했습니다.');
		} finally {
			setIsTyping(false);
		}
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

	const formatTime = (createdAt: string) => {
		return new Date(createdAt).toLocaleTimeString('ko-KR', {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const formatPrice = (price?: number) => {
		if (!price) return '';
		return price.toLocaleString() + '원';
	};

	return (
		<div className="web-chat-container">
			{/* 채팅 헤더 */}
			<div className="chat-header">
				<div className="property-info">
					{propertyImage && (
						<img 
							src={propertyImage} 
							alt={propertyTitle} 
							className="property-thumbnail"
						/>
					)}
					<div className="property-details">
						<h3 className="property-title">{propertyTitle}</h3>
						{propertyPrice && (
							<p className="property-price">{formatPrice(propertyPrice)}</p>
						)}
					</div>
				</div>
				<button onClick={onClose} className="close-btn">
					×
				</button>
			</div>

			{/* 메시지 영역 */}
			<div className="chat-messages">
				{loadingMessages ? (
					<div className="loading-messages">메시지를 불러오는 중...</div>
				) : (
					messages.map((message) => (
						<div
							key={message._id}
							className={`message ${message.senderId === userId ? 'user-message' : 'agent-message'}`}
						>
							<div className="message-content">{message.content}</div>
							<div className="message-time">{formatTime(message.createdAt)}</div>
						</div>
					))
				)}
				
				{isTyping && (
					<div className="message agent-message">
						<div className="typing-indicator">
							<span></span>
							<span></span>
							<span></span>
						</div>
					</div>
				)}
				
				<div ref={messagesEndRef} />
			</div>

			{/* 입력 영역 */}
			<div className="chat-input">
				<textarea
					ref={inputRef}
					value={inputMessage}
					onChange={handleInputChange}
					onKeyPress={handleKeyPress}
					placeholder="메시지를 입력하세요..."
					className="message-input"
					disabled={sendingMessage || creatingChat}
				/>
				<button
					onClick={handleSendMessage}
					disabled={!inputMessage.trim() || sendingMessage || creatingChat}
					className="send-btn"
				>
					<svg viewBox="0 0 24 24" fill="currentColor">
						<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
					</svg>
				</button>
			</div>

			{/* 빠른 답변 */}
			<div className="quick-actions">
				{quickMessages.map((message, index) => (
					<button
						key={index}
						onClick={() => handleQuickMessage(message)}
						className="quick-btn"
						disabled={sendingMessage || creatingChat}
					>
						{message}
					</button>
				))}
			</div>

			<style jsx>{`
				.web-chat-container {
					position: fixed;
					bottom: 0;
					left: 0;
					right: 0;
					background: white;
					border-top: 1px solid #e1e5e9;
					box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
					z-index: 1000;
					max-height: 80vh;
					display: flex;
					flex-direction: column;
				}

				.chat-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 1rem;
					border-bottom: 1px solid #f1f3f4;
					background: linear-gradient(135deg, #FF9500 0%, #FF6B00 100%);
					color: white;
				}

				.property-info {
					display: flex;
					align-items: center;
					gap: 0.75rem;
				}

				.property-thumbnail {
					width: 40px;
					height: 40px;
					border-radius: 8px;
					object-fit: cover;
				}

				.property-details {
					flex: 1;
				}

				.property-title {
					font-size: 0.9rem;
					font-weight: 600;
					color: #333;
					margin: 0 0 0.25rem 0;
				}

				.property-price {
					font-size: 0.8rem;
					color: #007bff;
					font-weight: 600;
					margin: 0;
				}

				.close-btn {
					background: none;
					border: none;
					font-size: 1.5rem;
					color: #666;
					cursor: pointer;
					padding: 0.25rem;
				}

				.chat-messages {
					flex: 1;
					overflow-y: auto;
					overflow-x: hidden;
					padding: 1rem;
					background: #f8f9fa;
					max-height: 300px;
					display: flex;
					flex-direction: column;
					justify-content: flex-end;
					align-items: flex-end;
					text-align: right;
				}

				.loading-messages {
					text-align: center;
					color: #666;
					padding: 1rem;
				}

				.message {
					margin-bottom: 1rem;
					padding: 0.75rem 1rem;
					border-radius: 12px;
					max-width: 85%;
					word-wrap: break-word;
					font-size: 0.9rem;
					margin-left: auto;
					margin-right: 0;
					width: fit-content;
					align-self: flex-end;
					text-align: right;
				}

				.user-message {
					background: linear-gradient(135deg, #FF9500 0%, #FF6B00 100%);
					color: white;
					margin-left: auto !important;
					margin-right: 0 !important;
					border-radius: 18px 18px 4px 18px;
					box-shadow: 0 1px 2px rgba(0,0,0,0.1);
					align-self: flex-end;
				}

				.agent-message {
					background: white;
					color: #333;
					border: none;
					border-radius: 18px 18px 18px 4px;
					box-shadow: 0 1px 2px rgba(0,0,0,0.1);
					margin-left: auto !important;
					margin-right: 0 !important;
					align-self: flex-end;
				}

				.message-time {
					font-size: 0.7rem;
					opacity: 0.7;
					margin-top: 0.25rem;
					text-align: right;
				}

				.typing-indicator {
					display: flex;
					gap: 4px;
					align-items: center;
					justify-content: flex-end;
					align-self: flex-end;
				}

				.typing-indicator span {
					width: 8px;
					height: 8px;
					border-radius: 50%;
					background: #ccc;
					animation: typing 1.4s infinite ease-in-out;
				}

				.typing-indicator span:nth-child(1) {
					animation-delay: -0.32s;
				}

				.typing-indicator span:nth-child(2) {
					animation-delay: -0.16s;
				}

				@keyframes typing {
					0%, 80%, 100% {
						transform: scale(0.8);
						opacity: 0.5;
					}
					40% {
						transform: scale(1);
						opacity: 1;
					}
				}

				.chat-input {
					display: flex;
					gap: 0.5rem;
					align-items: flex-end;
					padding: 1rem;
					background: white;
				}

				.message-input {
					flex: 1;
					padding: 0.75rem;
					border: 2px solid #e1e5e9;
					border-radius: 20px;
					font-size: 0.9rem;
					resize: none;
					min-height: 40px;
					max-height: 100px;
				}

				.message-input:focus {
					outline: none;
					border-color: #FF9500;
				}

				.send-btn {
					width: 40px;
					height: 40px;
					background: linear-gradient(135deg, #FF9500 0%, #FF6B00 100%);
					color: white;
					border: none;
					border-radius: 50%;
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					transition: all 0.3s ease;
					flex-shrink: 0;
				}

				.send-btn:hover:not(:disabled) {
					background: linear-gradient(135deg, #FF6B00 0%, #FF4500 100%);
					transform: scale(1.1);
				}

				.send-btn:disabled {
					background: #ccc;
					cursor: not-allowed;
					transform: none;
				}

				.send-btn svg {
					width: 16px;
					height: 16px;
				}

				.quick-actions {
					display: flex;
					gap: 0.5rem;
					padding: 0 1rem 1rem;
					flex-wrap: wrap;
				}

				.quick-btn {
					padding: 0.5rem 0.75rem;
					background: #f8f9fa;
					border: 1px solid #e1e5e9;
					border-radius: 20px;
					font-size: 0.8rem;
					cursor: pointer;
					transition: all 0.3s ease;
					white-space: nowrap;
				}

				.quick-btn:hover:not(:disabled) {
					background: rgba(255,149,0,0.1);
					border-color: #FF9500;
					color: #FF9500;
				}

				.quick-btn:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}

				@media (max-width: 768px) {
					.web-chat-container {
						max-height: 90vh;
					}

					.chat-messages {
						max-height: 250px;
					}

					.quick-actions {
						padding: 0 0.75rem 0.75rem;
					}

					.quick-btn {
						font-size: 0.75rem;
						padding: 0.4rem 0.6rem;
					}
				}
			`}</style>
		</div>
	);
};
