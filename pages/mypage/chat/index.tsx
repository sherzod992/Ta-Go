import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import { GET_MY_CHAT_ROOMS, GET_CHAT_MESSAGES, CHECK_CHAT_ROOM_EXISTS, GET_ALL_USER_CHAT_ROOMS, GET_CHAT_ROOM_MESSAGES, GET_MESSAGE_DEBUG_INFO } from '../../../apollo/user/query';
import { SEND_MESSAGE, MARK_AS_READ, CREATE_CHAT_ROOM } from '../../../apollo/user/mutation';
import { ChatRoom } from '../../../libs/types/chat/chat';
import { ChatRoomQueryInput } from '../../../libs/types/chat/chat.input';
import { sweetErrorAlert } from '../../../libs/sweetAlert';
import useDeviceDetect from '../../../libs/hooks/useDeviceDetect';
import { useWebSocket } from '../../../libs/hooks/useWebSocket';
import { useChatSubscriptions } from '../../../libs/hooks/useChatSubscriptions';
import LayoutBasic from '../../../libs/components/layout/LayoutBasic';
import { 
	Box, 
	Typography, 
	List, 
	ListItem, 
	ListItemAvatar, 
	ListItemText, 
	Avatar, 
	Chip, 
	Badge,
	CircularProgress,
	TextField,
	InputAdornment,
	Divider,
	Paper,
	IconButton,
	Tooltip,
	useTheme,
	useMediaQuery,
	Grid,
	Container,
	Button
} from '@mui/material';
import { 
	Search, 
	AccessTime, 
	Person, 
	Business,
	ChatBubble,
	Add,
	FilterList,
	Refresh,
	MoreVert,
	Star,
	StarBorder,
	Send,
	AttachFile
} from '@mui/icons-material';

const ChatListPage: React.FC = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const { isMobile } = useDeviceDetect();
	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
	
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([]);
	const [groupedRooms, setGroupedRooms] = useState<Map<string, ChatRoom[]>>(new Map());
	const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'active' | 'archived'>('all');
	const [sortBy, setSortBy] = useState<'recent' | 'unread' | 'name'>('recent');
	const [favoriteRooms, setFavoriteRooms] = useState<Set<string>>(new Set());
	const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
	const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
	const [isMounted, setIsMounted] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [messageInput, setMessageInput] = useState('');
	const [messages, setMessages] = useState<any[]>([]);
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	const [typingUsers, setTypingUsers] = useState<string[]>([]);
	const [isTyping, setIsTyping] = useState(false);

	// 사용자 ID (실제로는 인증된 사용자에서 가져와야 함)
	const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

	// WebSocket 연결 및 실시간 기능
	const {
		isConnected: wsConnected,
		joinRoom,
		leaveRoom,
		sendTypingStatus,
		markAsRead: wsMarkAsRead,
		typingUsers: wsTypingUsers,
	} = useWebSocket({
		onMessage: (message) => {
			console.log('WebSocket 새 메시지 수신:', message);
			if (message.roomId === selectedChatId) {
				// isAgent 필드에 대한 기본값 처리
				const processedMessage = {
					...message,
					isAgent: message.isAgent ?? false,
					isEdited: message.isEdited ?? false,
					isDeleted: message.isDeleted ?? false,
					isPinned: message.isPinned ?? false,
					isSystem: message.isSystem ?? false
				};
				setMessages(prev => [...prev, processedMessage]);
			}
		},
		onTyping: (data) => {
			console.log('WebSocket 타이핑 상태 수신:', data);
			if (data.roomId === selectedChatId) {
				setTypingUsers(prev => {
					const newUsers = data.isTyping 
						? [...prev.filter(id => id !== data.userId), data.userId]
						: prev.filter(id => id !== data.userId);
					return newUsers;
				});
			}
		},
		onNotification: (notification) => {
			console.log('WebSocket 새 알림 수신:', notification);
			// 알림 처리 로직
		},
	});

	// GraphQL Subscription
	const { messageSentData, typingIndicatorData, chatNotificationData } = useChatSubscriptions({
		roomId: selectedChatId || undefined,
		onMessageSent: (message) => {
			console.log('GraphQL Subscription 새 메시지 수신:', message);
			if (message.roomId === selectedChatId) {
				// isAgent 필드에 대한 기본값 처리
				const processedMessage = {
					...message,
					isAgent: message.isAgent ?? false,
					isEdited: message.isEdited ?? false,
					isDeleted: message.isDeleted ?? false,
					isPinned: message.isPinned ?? false,
					isSystem: message.isSystem ?? false
				};
				setMessages(prev => [...prev, processedMessage]);
			}
		},
		onTypingIndicator: (data) => {
			console.log('GraphQL Subscription 타이핑 상태 수신:', data);
			if (data.roomId === selectedChatId) {
				setTypingUsers(prev => {
					const newUsers = data.isTyping 
						? [...prev.filter(id => id !== data.userId), data.userId]
						: prev.filter(id => id !== data.userId);
					return newUsers;
				});
			}
		},
		onChatNotification: (notification) => {
			console.log('GraphQL Subscription 채팅 알림 수신:', notification);
			// 알림 처리 로직
		},
	});

	// 컴포넌트 마운트 상태 관리
	useEffect(() => {
		setIsMounted(true);
		
		// 라우터 이벤트 리스너 추가
		const handleRouteChangeStart = () => {
			console.log('페이지 전환 시작');
		};
		
		const handleRouteChangeComplete = () => {
			console.log('페이지 전환 완료');
		};
		
		const handleRouteChangeError = (err: any) => {
			console.error('페이지 전환 오류:', err);
		};
		
		router.events.on('routeChangeStart', handleRouteChangeStart);
		router.events.on('routeChangeComplete', handleRouteChangeComplete);
		router.events.on('routeChangeError', handleRouteChangeError);
		
		return () => {
			setIsMounted(false);
			router.events.off('routeChangeStart', handleRouteChangeStart);
			router.events.off('routeChangeComplete', handleRouteChangeComplete);
			router.events.off('routeChangeError', handleRouteChangeError);
		};
	}, [router]);

	// 사용자의 모든 채팅방 조회 (디버깅용)
	const { data: userChatRoomsData } = useQuery(GET_ALL_USER_CHAT_ROOMS, {
		variables: { userId: userId || '' },
		skip: !userId,
		onError: (error) => {
			console.error('사용자 채팅방 조회 에러:', error);
		}
	});

	// 메시지 조회 문제 진단을 위한 디버깅 쿼리들
	const { data: chatRoomMessagesData, refetch: refetchChatRoomMessages } = useQuery(GET_CHAT_ROOM_MESSAGES, {
		variables: { roomId: selectedChatId || '' },
		skip: !selectedChatId,
		onError: (error) => {
			console.error('채팅방 메시지 디버깅 조회 에러:', error);
		},
		onCompleted: (data) => {
			console.log('채팅방 메시지 디버깅 조회 완료:', data);
			if (data?.getChatRoomMessages?.list) {
				console.log('실제 메시지 개수:', data.getChatRoomMessages.list.length);
				console.log('첫 번째 메시지:', data.getChatRoomMessages.list[0]);
				console.log('마지막 메시지:', data.getChatRoomMessages.list[data.getChatRoomMessages.list.length - 1]);
			}
		},
		errorPolicy: 'all'
	});

	const { data: messageDebugInfoData } = useQuery(GET_MESSAGE_DEBUG_INFO, {
		variables: { roomId: selectedChatId || '' },
		skip: !selectedChatId,
		onError: (error) => {
			console.error('메시지 디버그 정보 조회 에러:', error);
		},
		onCompleted: (data) => {
			console.log('메시지 디버그 정보 조회 완료:', data);
			if (data?.getMessageDebugInfo) {
				console.log('디버그 정보:', data.getMessageDebugInfo);
			}
		},
		errorPolicy: 'all'
	});

	const { data, loading, error, refetch } = useQuery(GET_MY_CHAT_ROOMS, {
		variables: {
			input: {
				page: 1,
				limit: 50
			} as ChatRoomQueryInput
		},
		pollInterval: 15000, // 15초마다 폴링 (성능 최적화)
		onError: (error) => {
			console.error('채팅방 목록 조회 에러:', error);
			// 백엔드 개선 사항에 따라 더 구체적인 에러 처리
			if (error.message.includes('권한이 없습니다') || 
				error.message.includes('permission denied') ||
				error.message.includes('Unauthorized')) {
				console.log('채팅방 목록 조회 권한이 없습니다.');
				sweetErrorAlert('채팅방 목록을 조회할 권한이 없습니다.');
			} else {
				console.error('알 수 없는 채팅방 목록 조회 에러:', error);
				setHasError(true);
			}
		},
		errorPolicy: 'all',
		notifyOnNetworkStatusChange: false,
		fetchPolicy: 'cache-and-network',
		skip: !isMounted,
		onCompleted: (data) => {
			// 데이터 완료 시 로그
			if (data?.getMyChatRooms?.list) {
				console.log('채팅방 목록 로드됨:', data.getMyChatRooms.list.length);
			}
		}
	});

	// 선택된 채팅방의 메시지 조회
	const { data: messagesData, loading: messagesLoading, error: messagesError, refetch: refetchMessages } = useQuery(GET_CHAT_MESSAGES, {
		variables: {
			input: {
				roomId: selectedChatId || '',
				page: 1,
				limit: 100
			}
		},
		skip: !selectedChatId || !isMounted || selectedChatId === '',
		pollInterval: 3000, // 3초마다 폴링 (성능 최적화)
		errorPolicy: 'all', // 에러 정책을 all로 변경하여 에러가 있어도 데이터를 받을 수 있도록 함
		notifyOnNetworkStatusChange: false, // 네트워크 상태 변경 알림 비활성화
		fetchPolicy: 'cache-and-network',
		onError: (error) => {
			console.error('메시지 조회 에러:', error);
			console.log('선택된 채팅방 ID:', selectedChatId);
			console.log('선택된 매물 ID:', selectedPropertyId);
			console.log('메시지 조회 변수:', {
				roomId: selectedChatId || '',
				page: 1,
				limit: 100
			});
			
			// 백엔드 이중 조회 로직 개선사항에 따른 에러 처리
			if (error.message?.includes('채팅방을 찾을 수 없습니다') || 
				error.message?.includes('not found') ||
				error.message?.includes('Chat room not found')) {
				console.log('메시지 조회 시 채팅방이 존재하지 않습니다. 백엔드 이중 조회 로직이 처리했지만 실패했습니다.');
				
				// 디버깅 정보 출력
				console.log('=== 메시지 조회 문제 진단 ===');
				console.log('1. 선택된 채팅방 ID:', selectedChatId);
				console.log('2. 선택된 매물 ID:', selectedPropertyId);
				console.log('3. 사용자 ID:', userId);
				console.log('4. 채팅방 존재 여부:', '확인 중...');
				console.log('5. 사용자 채팅방 목록:', userChatRoomsData);
				
				// 사용자의 모든 채팅방에서 해당 매물의 채팅방을 찾아보기
				if (userChatRoomsData?.getAllUserChatRooms && selectedPropertyId) {
					const existingRoom = userChatRoomsData.getAllUserChatRooms.find(
						(room: any) => room.propertyId === selectedPropertyId && room.roomType === 'PROPERTY_INQUIRY'
					);
					
					if (existingRoom) {
						console.log('기존 채팅방을 찾았습니다:', existingRoom.roomId);
						console.log('현재 선택된 ID와 다른 경우 업데이트합니다.');
						console.log('기존 roomId:', existingRoom.roomId);
						console.log('현재 selectedChatId:', selectedChatId);
						setSelectedChatId(existingRoom.roomId);
						// 잠시 후 메시지 다시 조회
						setTimeout(() => {
							refetchMessages();
						}, 500);
						return;
					}
				}
				
				// 기존 채팅방이 없으면 새로 생성
				if (selectedPropertyId) {
					console.log('새 채팅방을 생성합니다.');
					createChatRoomForProperty(selectedPropertyId);
				}
			} else if (error.message?.includes('권한이 없습니다') || 
					   error.message?.includes('permission denied') ||
					   error.message.includes('Unauthorized')) {
				console.log('메시지 조회 권한이 없습니다.');
				sweetErrorAlert('메시지를 조회할 권한이 없습니다.');
			} else {
				console.error('알 수 없는 메시지 조회 에러:', error);
				// 알 수 없는 에러의 경우에도 채팅방을 다시 생성해보기
				if (selectedPropertyId) {
					console.log('알 수 없는 에러로 인해 채팅방을 재생성합니다.');
					createChatRoomForProperty(selectedPropertyId);
				}
			}
			setMessages([]);
		},
		onCompleted: (data) => {
			console.log('메시지 조회 완료:', data);
			console.log('백엔드 이중 조회 로직이 성공적으로 작동했습니다.');
			console.log('=== 메시지 조회 성공 정보 ===');
			console.log('1. 조회된 메시지 개수:', data?.getChatMessages?.list?.length || 0);
			console.log('2. 전체 메시지 개수:', data?.getChatMessages?.metaCounter?.total || 0);
			console.log('3. 첫 번째 메시지:', data?.getChatMessages?.list?.[0]);
			console.log('4. 마지막 메시지:', data?.getChatMessages?.list?.[data?.getChatMessages?.list?.length - 1]);
			
			if (data?.getChatMessages?.list && Array.isArray(data.getChatMessages.list)) {
				// senderNickname이 null인 경우 기본값 제공 및 senderId 정규화, isAgent 기본값 제공
				const processedMessages = data.getChatMessages.list.map((message: any) => ({
					...message,
					senderId: String(message.senderId), // senderId를 문자열로 정규화
					senderNickname: message.senderNickname || '알 수 없음',
					isAgent: message.isAgent ?? false, // isAgent가 null이면 false로 기본값 설정
					isEdited: message.isEdited ?? false,
					isDeleted: message.isDeleted ?? false,
					isPinned: message.isPinned ?? false,
					isSystem: message.isSystem ?? false
				}));
				setMessages(processedMessages);
				
				// 메시지 업데이트 후 스크롤을 맨 아래로
				setTimeout(() => {
					const messageContainer = document.querySelector('[data-message-container]') as HTMLElement;
					if (messageContainer) {
						// 스크롤을 맨 아래로 이동하여 최신 메시지가 오른쪽 아래에 표시되도록 함
						messageContainer.scrollTop = messageContainer.scrollHeight;
						// 추가로 스크롤을 오른쪽 끝으로 이동
						messageContainer.scrollLeft = messageContainer.scrollWidth;
					}
				}, 100);
			} else {
				setMessages([]);
			}
		}
	});

	// 메시지 전송 뮤테이션
	const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
		onCompleted: (data) => {
			setMessageInput('');
			console.log('메시지 전송 성공 - 백엔드 이중 조회 로직이 정상 작동했습니다.');
			// 수동으로 메시지 새로고침
			if (selectedChatId) {
				refetchMessages();
			}
			refetch(); // 채팅방 목록 새로고침
		},
		onError: (error) => {
			console.error('메시지 전송 에러:', error);
			// 백엔드 이중 조회 로직 개선사항에 따른 에러 처리
			if (error.message.includes('채팅방을 찾을 수 없습니다') || 
				error.message.includes('not found') ||
				error.message.includes('Chat room not found')) {
				console.log('메시지 전송 시 채팅방이 존재하지 않습니다. 백엔드 이중 조회 로직이 처리했지만 실패했습니다.');
				if (selectedPropertyId) {
					createChatRoomForProperty(selectedPropertyId);
				}
			} else if (error.message.includes('권한이 없습니다') || 
					   error.message.includes('permission denied') ||
					   error.message.includes('Unauthorized')) {
				console.log('메시지 전송 권한이 없습니다.');
				sweetErrorAlert('메시지를 전송할 권한이 없습니다.');
			} else {
				sweetErrorAlert('메시지 전송에 실패했습니다.');
			}
		}
	});

	// 메시지 읽음 처리 뮤테이션
	const [markAsRead] = useMutation(MARK_AS_READ, {
		onCompleted: () => {
			console.log('메시지 읽음 처리 성공 - 백엔드 이중 조회 로직이 정상 작동했습니다.');
			refetch(); // 채팅방 목록 새로고침
		},
		onError: (error) => {
			console.error('메시지 읽음 처리 에러:', error);
			// 백엔드 이중 조회 로직 개선사항에 따른 에러 처리
			if (error.message.includes('채팅방을 찾을 수 없습니다') || 
				error.message.includes('not found') ||
				error.message.includes('Chat room not found')) {
				console.log('메시지 읽음 처리 시 채팅방이 존재하지 않습니다. 백엔드 이중 조회 로직이 처리했지만 실패했습니다.');
			} else if (error.message.includes('권한이 없습니다') || 
					   error.message.includes('permission denied') ||
					   error.message.includes('Unauthorized')) {
				console.log('메시지 읽음 처리 권한이 없습니다.');
			}
		}
	});

	// 채팅방 생성 뮤테이션
	const [createChatRoom] = useMutation(CREATE_CHAT_ROOM, {
		onCompleted: (data) => {
			console.log('채팅방 생성 성공:', data);
			console.log('새로 생성된 채팅방은 백엔드 이중 조회 로직을 통해 안전하게 조회됩니다.');
			refetch(); // 채팅방 목록 새로고침
		},
		onError: (error) => {
			console.error('채팅방 생성 에러:', error);
			// 백엔드 이중 조회 로직 개선사항에 따른 에러 처리
			if (error.message.includes('이미 존재하는 채팅방') || 
				error.message.includes('already exists') ||
				error.message.includes('Chat room already exists')) {
				console.log('이미 존재하는 채팅방입니다. 백엔드 이중 조회 로직으로 찾을 수 있습니다.');
				// 기존 채팅방을 찾아서 선택
				if (userChatRoomsData?.getAllUserChatRooms) {
					const existingRoom = userChatRoomsData.getAllUserChatRooms.find(
						(room: any) => room.propertyId === selectedPropertyId && room.roomType === 'PROPERTY_INQUIRY'
					);
					if (existingRoom) {
						setSelectedChatId(existingRoom.roomId);
					}
				}
			} else {
				sweetErrorAlert('채팅방 생성에 실패했습니다.');
			}
		}
	});

	useEffect(() => {
		if (!isMounted) return;
		
		try {
			if (data?.getMyChatRooms?.list && Array.isArray(data.getMyChatRooms.list)) {
				let rooms = [...data.getMyChatRooms.list];
				
				// 데이터 검증 및 정리
				rooms = rooms.filter((room: ChatRoom) => {
					// 필수 필드 검증
					if (!room._id || !room.propertyId || !room.propertyTitle) {
						console.warn('Invalid chat room data:', room);
						return false;
					}
					
					// propertyTitle이 유효한 문자열인지 확인
					if (typeof room.propertyTitle !== 'string' || room.propertyTitle.trim() === '') {
						console.warn('Invalid property title:', room.propertyTitle);
						return false;
					}
					
					// propertyId가 유효한 문자열인지 확인
					if (typeof room.propertyId !== 'string' || room.propertyId.trim() === '') {
						console.warn('Invalid property ID:', room.propertyId);
						return false;
					}
					
					return true;
				});
				
				// 필터링
				if (selectedFilter === 'unread') {
					rooms = rooms.filter((room: ChatRoom) => room.unreadCountForUser > 0);
				} else if (selectedFilter === 'active') {
					rooms = rooms.filter((room: ChatRoom) => room.status === 'ACTIVE');
				} else if (selectedFilter === 'archived') {
					rooms = rooms.filter((room: ChatRoom) => room.status === 'CLOSED');
				}
				
				// 검색
				if (searchTerm) {
					rooms = rooms.filter((room: ChatRoom) => 
						room.propertyTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
						room.agentNickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
						room.lastMessageContent?.toLowerCase().includes(searchTerm.toLowerCase())
					);
				}
				
				// 매물별로 그룹화
				const grouped = new Map<string, ChatRoom[]>();
				rooms.forEach((room: ChatRoom) => {
					const propertyId = room.propertyId.trim();
					if (!grouped.has(propertyId)) {
						grouped.set(propertyId, []);
					}
					grouped.get(propertyId)!.push(room);
				});
				
				// 그룹화된 채팅방들을 하나의 대표 채팅방으로 변환
				const representativeRooms: ChatRoom[] = [];
				grouped.forEach((propertyRooms: ChatRoom[], propertyId: string) => {
					if (propertyRooms.length > 0) {
						// 가장 최근 메시지가 있는 채팅방을 대표로 선택
						const representative = propertyRooms.reduce((latest, current) => {
							const latestTime = new Date(latest.lastMessageTime || '').getTime();
							const currentTime = new Date(current.lastMessageTime || '').getTime();
							return currentTime > latestTime ? current : latest;
						});
						
						// 해당 매물의 모든 채팅방의 읽지 않은 메시지 수를 합산
						const totalUnreadCount = propertyRooms.reduce((sum, room) => sum + (room.unreadCountForUser || 0), 0);
						
						// 대표 채팅방 정보 업데이트
						const representativeRoom: ChatRoom = {
							...representative,
							unreadCountForUser: totalUnreadCount,
							propertyId: propertyId,
							propertyTitle: representative.propertyTitle?.trim() || '알 수 없는 매물'
						};
						
						representativeRooms.push(representativeRoom);
					}
				});
				
				// 정렬
				representativeRooms.sort((a: ChatRoom, b: ChatRoom) => {
					if (sortBy === 'unread') {
						return (b.unreadCountForUser || 0) - (a.unreadCountForUser || 0);
					} else if (sortBy === 'name') {
						return (a.propertyTitle || '').localeCompare(b.propertyTitle || '');
					} else {
						return new Date(b.lastMessageTime || '').getTime() - new Date(a.lastMessageTime || '').getTime();
					}
				});
				
				setFilteredRooms(representativeRooms);
				setGroupedRooms(grouped);
				
					// 첫 번째 채팅방을 자동 선택 (선택된 채팅방이 없을 때만)
	if (representativeRooms.length > 0 && !selectedChatId) {
		// 실제로 존재하는 채팅방인지 확인 후 선택
		const firstRoom = representativeRooms[0];
		setSelectedChatId(firstRoom._id);
		setSelectedPropertyId(firstRoom.propertyId);
		
		// 채팅방 존재 여부 확인
		setTimeout(async () => {
			try {
				await refetchMessages();
			} catch (error) {
				console.log('첫 번째 채팅방이 존재하지 않습니다. 생성합니다.');
				await createChatRoomForProperty(firstRoom.propertyId);
			}
		}, 100);
	}
			} else {
				setFilteredRooms([]);
				setGroupedRooms(new Map());
			}
		} catch (error) {
			console.error('Error processing chat rooms:', error);
			setHasError(true);
		}
	}, [data, searchTerm, selectedFilter, sortBy, isMounted]);

	// 메시지가 업데이트되면 자동 스크롤
	useEffect(() => {
		if (messages.length > 0) {
			try {
				const messageContainer = document.querySelector('[data-message-container]') as HTMLElement;
				if (messageContainer) {
					// 스크롤을 맨 아래로 이동하여 최신 메시지가 오른쪽 아래에 표시되도록 함
					messageContainer.scrollTop = messageContainer.scrollHeight;
					// 추가로 스크롤을 오른쪽 끝으로 이동
					messageContainer.scrollLeft = messageContainer.scrollWidth;
				}
			} catch (error) {
				console.error('Auto scroll error:', error);
			}
		}
	}, [messages]);

	// 메시지 전송 후 즉시 스크롤
	useEffect(() => {
		if (messages.length > 0) {
			setTimeout(() => {
				const messageContainer = document.querySelector('[data-message-container]') as HTMLElement;
				if (messageContainer) {
					// 스크롤을 맨 아래로 이동하여 최신 메시지가 오른쪽 아래에 표시되도록 함
					messageContainer.scrollTop = messageContainer.scrollHeight;
					// 추가로 스크롤을 오른쪽 끝으로 이동
					messageContainer.scrollLeft = messageContainer.scrollWidth;
				}
			}, 100);
		}
	}, [messages.length]);

	// 컴포넌트 마운트 시 스크롤
	useEffect(() => {
		setTimeout(() => {
			const messageContainer = document.querySelector('[data-message-container]') as HTMLElement;
			if (messageContainer) {
				// 스크롤을 맨 아래로 이동하여 최신 메시지가 오른쪽 아래에 표시되도록 함
				messageContainer.scrollTop = messageContainer.scrollHeight;
				// 추가로 스크롤을 오른쪽 끝으로 이동
				messageContainer.scrollLeft = messageContainer.scrollWidth;
			}
		}, 200);
	}, []);

	const handleChatRoomClick = async (chatId: string, propertyId: string) => {
		console.log('채팅방 클릭:', { chatId, propertyId });
		console.log('백엔드 이중 조회 로직이 roomId와 _id 모두로 채팅방을 찾을 것입니다.');
		
		// 유효한 채팅방인지 확인
		const selectedRoom = filteredRooms.find(r => r._id === chatId);
		if (!selectedRoom) {
			console.error('유효하지 않은 채팅방:', chatId);
			sweetErrorAlert('유효하지 않은 채팅방입니다.');
			return;
		}
		
		// 이전 채팅방에서 나가기
		if (selectedChatId) {
			leaveRoom(selectedChatId);
		}
		
		// 상태 초기화
		setMessages([]);
		setMessageInput('');
		setTypingUsers([]);
		
		// 새로운 선택
		setSelectedChatId(chatId);
		setSelectedPropertyId(propertyId);
		
		// 새 채팅방 참가
		joinRoom(chatId);
		
		// 채팅방 존재 여부를 먼저 확인
		try {
			// 사용자의 모든 채팅방에서 해당 매물의 채팅방을 찾아보기
			if (userChatRoomsData?.getAllUserChatRooms) {
				const existingRoom = userChatRoomsData.getAllUserChatRooms.find(
					(room: any) => room.propertyId === propertyId && room.roomType === 'PROPERTY_INQUIRY'
				);
				
				if (existingRoom && existingRoom.roomId !== chatId) {
					console.log('다른 채팅방 ID를 찾았습니다. 업데이트합니다:', existingRoom.roomId);
					console.log('백엔드 이중 조회 로직이 두 ID 모두로 채팅방을 찾을 수 있습니다.');
					setSelectedChatId(existingRoom.roomId);
					chatId = existingRoom.roomId; // chatId 업데이트
				}
			}
			
			// 메시지 조회 시도
			setTimeout(async () => {
				try {
					await refetchMessages();
					console.log('메시지 조회 성공 - 백엔드 이중 조회 로직이 정상 작동했습니다.');
				} catch (error) {
					console.log('메시지 조회 실패, 채팅방을 생성합니다:', error);
					try {
						await createChatRoomForProperty(propertyId);
					} catch (createError) {
						console.error('채팅방 생성 실패:', createError);
						sweetErrorAlert('채팅방을 생성할 수 없습니다.');
					}
				}
			}, 100);
			
		} catch (error) {
			console.error('채팅방 클릭 처리 중 에러:', error);
			// 에러가 발생해도 채팅방 생성 시도
			try {
				await createChatRoomForProperty(propertyId);
			} catch (createError) {
				console.error('채팅방 생성 실패:', createError);
			}
		}
		
		if (isMobile) {
			// 라우팅 개선: replace를 사용하여 브라우저 히스토리 문제 해결
			router.replace(`/mypage/chat/${chatId}`, undefined, { shallow: false });
		}
	};

	const handleSendMessage = async () => {
		if (!messageInput.trim() || !selectedChatId) {
			console.log('메시지 전송 조건 불충족:', { messageInput: messageInput.trim(), selectedChatId });
			return;
		}
		
		const currentMessage = messageInput.trim();
		setMessageInput('');
		
		// 임시 메시지 생성 (즉시 UI에 표시)
		const tempMessage = {
			_id: `temp-${Date.now()}`,
			messageId: `temp-${Date.now()}`,
			roomId: selectedChatId,
			content: currentMessage,
			senderId: String(userId), // 문자열로 확실히 변환
			messageType: 'TEXT',
			status: 'SENDING',
			senderNickname: '나',
			isAgent: false, // 명시적으로 false 설정
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
			const messageContainer = document.querySelector('[data-message-container]') as HTMLElement;
			if (messageContainer) {
				// 스크롤을 맨 아래로 이동하여 최신 메시지가 오른쪽 아래에 표시되도록 함
				messageContainer.scrollTop = messageContainer.scrollHeight;
				// 추가로 스크롤을 오른쪽 끝으로 이동
				messageContainer.scrollLeft = messageContainer.scrollWidth;
			}
		}, 50);
		
		console.log('메시지 전송 시작:', { selectedChatId, content: currentMessage });
		console.log('백엔드 이중 조회 로직이 roomId와 _id 모두로 채팅방을 찾을 것입니다.');
		
		try {
			await sendMessage({
				variables: {
					input: {
						roomId: selectedChatId,
						content: currentMessage,
						messageType: 'TEXT'
					}
				}
			});
			
			console.log('메시지 전송 성공 - 백엔드 이중 조회 로직이 정상 작동했습니다.');
			
			// 성공 시 임시 메시지를 실제 메시지로 업데이트
			setMessages(prev => 
				prev.map(msg => 
					msg._id === tempMessage._id 
						? { ...msg, status: 'SENT', _id: `sent-${Date.now()}` }
						: msg
				)
			);

			// 폴링으로 자동 업데이트되므로 수동 새로고침 제거
			
		} catch (error: any) {
			console.error('메시지 전송 실패:', error);
			
			// 실패 시 임시 메시지 제거
			setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
			
			// 백엔드 이중 조회 로직 개선사항에 따른 에러 처리
			if (error?.message?.includes('채팅방을 찾을 수 없습니다') || 
				error?.message?.includes('not found') ||
				error?.message?.includes('Chat room not found')) {
				console.log('메시지 전송 중 채팅방이 존재하지 않습니다. 백엔드 이중 조회 로직이 처리했지만 실패했습니다.');
				
				if (selectedPropertyId) {
					try {
						await createChatRoomForProperty(selectedPropertyId);
						// 채팅방 생성 후 메시지 다시 전송
						setTimeout(() => {
							handleSendMessage();
						}, 1000);
					} catch (createError) {
						console.error('채팅방 생성 실패:', createError);
						sweetErrorAlert('채팅방을 생성할 수 없습니다.');
					}
				} else {
					sweetErrorAlert('매물 정보가 없어 채팅방을 생성할 수 없습니다.');
				}
			} else if (error?.message?.includes('권한이 없습니다') || 
					   error?.message?.includes('permission denied') ||
					   error?.message?.includes('Unauthorized')) {
				console.log('메시지 전송 권한이 없습니다.');
				sweetErrorAlert('메시지를 전송할 권한이 없습니다.');
			} else {
				sweetErrorAlert('메시지 전송에 실패했습니다.');
			}
		}
	};

	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSendMessage();
		}
	};

	// 타이핑 상태 관리
	const handleTyping = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		setMessageInput(value);
		
		// 타이핑 상태 전송
		if (selectedChatId && wsConnected) {
			if (!isTyping && value.length > 0) {
				setIsTyping(true);
				sendTypingStatus(selectedChatId, true);
			} else if (isTyping && value.length === 0) {
				setIsTyping(false);
				sendTypingStatus(selectedChatId, false);
			}
		}
	}, [selectedChatId, wsConnected, isTyping, sendTypingStatus]);

	// 타이핑 상태 정리
	useEffect(() => {
		const timer = setTimeout(() => {
			if (isTyping && selectedChatId && wsConnected) {
				setIsTyping(false);
				sendTypingStatus(selectedChatId, false);
			}
		}, 3000); // 3초 후 타이핑 상태 해제

		return () => clearTimeout(timer);
	}, [isTyping, selectedChatId, wsConnected, sendTypingStatus]);

	const createChatRoomForProperty = async (propertyId: string) => {
		console.log('채팅방 생성 시작:', { propertyId, userId });
		console.log('새로 생성된 채팅방은 백엔드 이중 조회 로직을 통해 안전하게 조회됩니다.');
		
		if (!userId) {
			console.error('사용자 ID가 없습니다.');
			sweetErrorAlert('로그인이 필요합니다.');
			return;
		}
		
		try {
			// 먼저 기존 채팅방이 있는지 확인
			if (userChatRoomsData?.getAllUserChatRooms) {
				const existingRoom = userChatRoomsData.getAllUserChatRooms.find(
					(room: any) => room.propertyId === propertyId && room.roomType === 'PROPERTY_INQUIRY'
				);
				
				if (existingRoom) {
					console.log('기존 채팅방이 있습니다:', existingRoom.roomId);
					console.log('백엔드 이중 조회 로직이 roomId와 _id 모두로 이 채팅방을 찾을 수 있습니다.');
					setSelectedChatId(existingRoom.roomId);
					setSelectedPropertyId(propertyId);
					return;
				}
			}
			
			const result = await createChatRoom({
				variables: {
					input: {
						roomType: 'PROPERTY_INQUIRY',
						propertyId: propertyId,
						userId: userId
					}
				}
			});

			if (result.data?.createChatRoom) {
				console.log('채팅방 생성 성공:', result.data.createChatRoom);
				console.log('새로 생성된 채팅방은 백엔드 이중 조회 로직을 통해 안전하게 조회됩니다.');
				// 새로 생성된 채팅방으로 선택 변경
				setSelectedChatId(result.data.createChatRoom.roomId);
				setSelectedPropertyId(propertyId);
				
				// 채팅방 목록 새로고침
				await refetch();
				
				// 잠시 후 메시지 조회 시도
				setTimeout(async () => {
					try {
						await refetchMessages();
					} catch (error) {
						console.error('새 채팅방 메시지 조회 실패:', error);
					}
				}, 1000);
			}
		} catch (error: any) {
			console.error('채팅방 생성 실패:', error);
			
			// 이미 존재하는 채팅방 에러인 경우
			if (error?.message?.includes('이미 존재하는 채팅방') || 
				error?.message?.includes('already exists') ||
				error?.message?.includes('Chat room already exists')) {
				console.log('이미 존재하는 채팅방입니다. 백엔드 이중 조회 로직으로 찾을 수 있습니다.');
				
				// 기존 채팅방을 찾아서 선택
				if (userChatRoomsData?.getAllUserChatRooms) {
					const existingRoom = userChatRoomsData.getAllUserChatRooms.find(
						(room: any) => room.propertyId === propertyId && room.roomType === 'PROPERTY_INQUIRY'
					);
					if (existingRoom) {
						console.log('기존 채팅방을 찾았습니다:', existingRoom.roomId);
						setSelectedChatId(existingRoom.roomId);
						setSelectedPropertyId(propertyId);
						
						// 채팅방 목록 새로고침
						await refetch();
						return;
					}
				}
			}
			
			sweetErrorAlert('채팅방 생성에 실패했습니다.');
		}
	};

	const handleFavoriteToggle = (chatId: string) => {
		setFavoriteRooms(prev => {
			const newSet = new Set(prev);
			if (newSet.has(chatId)) {
				newSet.delete(chatId);
			} else {
				newSet.add(chatId);
			}
			return newSet;
		});
	};

	const formatTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 1) {
			return '방금 전';
		} else if (diffInHours < 24) {
			return `${Math.floor(diffInHours)}시간 전`;
		} else {
			return date.toLocaleDateString('ko-KR');
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'ACTIVE':
				return 'success';
			case 'PENDING':
				return 'warning';
			case 'CLOSED':
				return 'default';
			default:
				return 'default';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'ACTIVE':
				return '진행중';
			case 'PENDING':
				return '대기중';
			case 'CLOSED':
				return '종료';
			default:
				return status;
		}
	};

	const getUnreadCountColor = (count: number) => {
		if (count > 10) return '#f44336';
		if (count > 5) return '#ff9800';
		return '#2196f3';
	};

	// 메시지 조회 문제 진단을 위한 디버깅 함수
	const diagnoseMessageIssue = async () => {
		if (!selectedChatId) {
			console.log('선택된 채팅방이 없습니다.');
			return;
		}

		console.log('=== 메시지 조회 문제 진단 시작 ===');
		console.log('1. 현재 선택된 채팅방 ID:', selectedChatId);
		console.log('2. 현재 선택된 매물 ID:', selectedPropertyId);
		console.log('3. 사용자 ID:', userId);

		// 채팅방 존재 여부 확인
		try {
			// await refetchChatRoomExists(); // 이 쿼리는 현재 사용되지 않으므로 주석 처리
			console.log('4. 채팅방 존재 여부 확인 완료 (미구현)');
		} catch (error) {
			console.error('채팅방 존재 여부 확인 실패:', error);
		}

		// 채팅방 메시지 직접 조회
		try {
			await refetchChatRoomMessages();
			console.log('5. 채팅방 메시지 직접 조회 완료');
		} catch (error) {
			console.error('채팅방 메시지 직접 조회 실패:', error);
		}

		// 메시지 조회 재시도
		try {
			await refetchMessages();
			console.log('6. 메시지 조회 재시도 완료');
		} catch (error) {
			console.error('메시지 조회 재시도 실패:', error);
		}

		console.log('=== 메시지 조회 문제 진단 완료 ===');
	};

	if (!isMounted) {
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
					페이지를 불러오는 중...
				</Typography>
			</Box>
		);
	}

	if (hasError) {
		return (
			<Box 
				display="flex" 
				justifyContent="center" 
				alignItems="center" 
				minHeight="400px"
				flexDirection="column"
				gap={2}
			>
				<Typography variant="h6" color="error">
					페이지 로딩 중 오류가 발생했습니다.
				</Typography>
				<Typography variant="body2" color="text.secondary">
					페이지를 새로고침해주세요.
				</Typography>
				<IconButton 
					onClick={() => window.location.reload()}
					sx={{ 
						bgcolor: 'primary.main', 
						color: 'white',
						'&:hover': { bgcolor: 'primary.dark' }
					}}
				>
					<Refresh />
				</IconButton>
			</Box>
		);
	}

	if (loading) {
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

	if (error && !data?.getMyChatRooms?.list) {
		return (
			<Box 
				display="flex" 
				justifyContent="center" 
				alignItems="center" 
				minHeight="400px"
				flexDirection="column"
				gap={2}
			>
				<Typography variant="h6" color="error">
					채팅방 목록을 불러오는데 실패했습니다.
				</Typography>
				<Typography variant="body2" color="text.secondary">
					잠시 후 다시 시도해주세요.
				</Typography>
				<IconButton 
					onClick={() => refetch()}
					sx={{ 
						bgcolor: 'primary.main', 
						color: 'white',
						'&:hover': { bgcolor: 'primary.dark' }
					}}
				>
					<Refresh />
				</IconButton>
			</Box>
		);
	}

	// 모바일에서는 기존 레이아웃 사용
	if (isMobile) {
		return (
			<Box sx={{ 
				maxWidth: 1200, 
				margin: '0 auto', 
				padding: 1,
				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				minHeight: '100vh'
			}}>
				{/* 헤더 */}
				<Paper 
					elevation={8} 
					sx={{ 
						borderRadius: 3, 
						mb: 3, 
						overflow: 'hidden',
						background: 'rgba(255, 255, 255, 0.95)',
						backdropFilter: 'blur(10px)'
					}}
				>
					<Box sx={{ 
						p: 3, 
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						color: 'white'
					}}>
						<Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
							💬 내 채팅방
						</Typography>
						<Typography variant="body1" sx={{ opacity: 0.9 }}>
							총 {filteredRooms.length}개의 매물 채팅방
							{filteredRooms.reduce((total, room) => total + room.unreadCountForUser, 0) > 0 && (
								<span style={{ 
									color: '#ffeb3b', 
									fontWeight: 'bold',
									marginLeft: 8
								}}>
									({filteredRooms.reduce((total, room) => total + room.unreadCountForUser, 0)}개 읽지 않음)
								</span>
							)}
						</Typography>
					</Box>

					{/* 검색 및 필터 */}
					<Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
						<TextField
							fullWidth
							variant="outlined"
							placeholder="매물명, 상대방 이름, 메시지로 검색..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<Search sx={{ color: 'primary.main' }} />
									</InputAdornment>
								),
							}}
							sx={{ 
								'& .MuiOutlinedInput-root': {
									borderRadius: 2,
									'&:hover fieldset': {
										borderColor: 'primary.main',
									},
								},
							}}
						/>
						
						<Box sx={{ display: 'flex', gap: 1 }}>
							<Tooltip title="새로고침">
								<IconButton 
									onClick={() => refetch()}
									sx={{ 
										bgcolor: 'secondary.main', 
										color: 'white',
										'&:hover': { bgcolor: 'secondary.dark' }
									}}
								>
									<Refresh />
								</IconButton>
							</Tooltip>
						</Box>
					</Box>
				</Paper>

				{/* 채팅방 목록 */}
				{filteredRooms.length === 0 ? (
					<Paper 
						elevation={4} 
						sx={{ 
							borderRadius: 3, 
							p: 6, 
							textAlign: 'center',
							background: 'rgba(255, 255, 255, 0.95)',
							backdropFilter: 'blur(10px)'
						}}
					>
						<ChatBubble sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
						<Typography variant="h5" color="text.secondary" gutterBottom fontWeight="bold">
							{searchTerm ? '검색 결과가 없습니다.' : '채팅방이 없습니다.'}
						</Typography>
						<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
							{searchTerm ? '다른 검색어를 시도해보세요.' : '매물에 문의하시면 채팅방이 생성됩니다.'}
						</Typography>
					</Paper>
				) : (
					<Paper 
						elevation={4} 
						sx={{ 
							borderRadius: 3,
							overflow: 'hidden',
							background: 'rgba(255, 255, 255, 0.95)',
							backdropFilter: 'blur(10px)'
						}}
					>
						<List sx={{ p: 0 }}>
							{filteredRooms.map((room, index) => (
								<React.Fragment key={room._id}>
									<ListItem
										button
										onClick={() => handleChatRoomClick(room._id, room.propertyId)}
										sx={{
											p: 3,
											'&:hover': {
												backgroundColor: 'rgba(102, 126, 234, 0.08)',
												transform: 'translateX(4px)',
												transition: 'all 0.3s ease'
											},
											'&:active': {
												backgroundColor: 'rgba(102, 126, 234, 0.12)',
											},
											borderLeft: room.unreadCountForUser > 0 ? '4px solid #667eea' : '4px solid transparent',
										}}
									>
										<ListItemAvatar sx={{ mr: 2 }}>
											<Badge
												badgeContent={room.unreadCountForUser}
												color="error"
												max={99}
												overlap="circular"
												sx={{
													'& .MuiBadge-badge': {
														backgroundColor: getUnreadCountColor(room.unreadCountForUser),
														fontWeight: 'bold'
													}
												}}
											>
												<Avatar
													src={room.propertyTitle && room.propertyTitle.trim() !== '' ? undefined : undefined}
													alt={room.propertyTitle || '매물'}
													sx={{ 
														width: 60, 
														height: 60,
														border: '2px solid #e3f2fd',
														bgcolor: 'primary.main'
													}}
												>
													<Business sx={{ fontSize: 28 }} />
												</Avatar>
											</Badge>
										</ListItemAvatar>

										<ListItemText
											primary={
												<Box display="flex" alignItems="center" gap={1} mb={1}>
													<Typography variant="h6" component="span" fontWeight="bold" color="text.primary">
														{room.propertyTitle}
													</Typography>
													<Chip
														label={getStatusText(room.status)}
														color={getStatusColor(room.status) as any}
														size="small"
														sx={{ 
															borderRadius: 1,
															fontWeight: 'bold'
														}}
													/>
													{room.unreadCountForUser > 0 && (
														<Chip
															label={`${room.unreadCountForUser}개 새 메시지`}
															color="error"
															size="small"
															sx={{ 
																borderRadius: 1,
																fontWeight: 'bold',
																backgroundColor: getUnreadCountColor(room.unreadCountForUser)
															}}
														/>
													)}
												</Box>
											}
											secondary={
												<Box>
													<Box display="flex" alignItems="center" gap={1} mb={1}>
														<Person sx={{ fontSize: 16, color: 'primary.main' }} />
														<Typography variant="body2" color="text.secondary" fontWeight="medium">
															{room.agentNickname || '담당자 미배정'}
														</Typography>
													</Box>
													{room.lastMessageContent && (
														<Box display="flex" alignItems="center" gap={1}>
															<AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
															<Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
																{room.lastMessageContent.length > 60
																	? room.lastMessageContent.substring(0, 60) + '...'
																	: room.lastMessageContent}
															</Typography>
															<Typography variant="caption" color="text.secondary" fontWeight="medium">
																{formatTime(room.lastMessageTime || '')}
															</Typography>
														</Box>
													)}
												</Box>
											}
										/>
										
										<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
											<IconButton
												onClick={(e) => {
													e.stopPropagation();
													handleFavoriteToggle(room._id);
												}}
												size="small"
												sx={{ 
													color: favoriteRooms.has(room._id) ? '#ffc107' : 'text.secondary',
													'&:hover': { color: '#ffc107' }
												}}
											>
												{favoriteRooms.has(room._id) ? <Star /> : <StarBorder />}
											</IconButton>
											
											<IconButton size="small" sx={{ color: 'text.secondary' }}>
												<MoreVert />
											</IconButton>
										</Box>
									</ListItem>
									{index < filteredRooms.length - 1 && (
										<Divider sx={{ mx: 3, opacity: 0.3 }} />
									)}
								</React.Fragment>
							))}
						</List>
					</Paper>
				)}
			</Box>
		);
	}

	// 데스크톱 레이아웃 - 왼쪽 채팅 목록, 오른쪽 채팅창
	return (
		<Container maxWidth={false} sx={{ 
			height: '100vh', 
			p: 0, 
			background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
		}}>
			<Grid container sx={{ height: '100%' }}>
				{/* 왼쪽 채팅 목록 */}
				<Grid item xs={12} md={4} lg={3} sx={{ height: '100%', p: 2 }}>
					<Paper 
						elevation={8} 
						sx={{ 
							height: '100%',
							borderRadius: 3,
							overflow: 'hidden',
							background: 'rgba(255, 255, 255, 0.95)',
							backdropFilter: 'blur(10px)',
							display: 'flex',
							flexDirection: 'column'
						}}
					>
						{/* 헤더 */}
						<Box sx={{ 
							p: 3, 
							background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							color: 'white'
						}}>
							<Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
								💬 채팅방
							</Typography>
							<Typography variant="body2" sx={{ opacity: 0.9 }}>
								총 {filteredRooms.length}개 매물
								{filteredRooms.reduce((total, room) => total + room.unreadCountForUser, 0) > 0 && (
									<span style={{ 
										color: '#ffeb3b', 
										fontWeight: 'bold',
										marginLeft: 8
									}}>
										({filteredRooms.reduce((total, room) => total + room.unreadCountForUser, 0)}개 읽지 않음)
									</span>
								)}
							</Typography>
						</Box>

						{/* 검색 */}
						<Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
							<TextField
								fullWidth
								variant="outlined"
								placeholder="검색..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Search sx={{ color: 'primary.main' }} />
										</InputAdornment>
									),
								}}
								sx={{ 
									'& .MuiOutlinedInput-root': {
										borderRadius: 2,
										'&:hover fieldset': {
											borderColor: 'primary.main',
										},
									},
								}}
							/>
						</Box>

						{/* 채팅방 목록 */}
						<Box sx={{ flex: 1, overflow: 'auto' }}>
							{filteredRooms.length === 0 ? (
								<Box sx={{ 
									p: 4, 
									textAlign: 'center',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									gap: 2
								}}>
									<ChatBubble sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
									<Typography variant="h6" color="text.secondary" fontWeight="bold">
										{searchTerm ? '검색 결과가 없습니다.' : '채팅방이 없습니다.'}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{searchTerm ? '다른 검색어를 시도해보세요.' : '매물에 문의하시면 채팅방이 생성됩니다.'}
									</Typography>
								</Box>
							) : (
								<List sx={{ p: 0 }}>
									{filteredRooms.map((room, index) => (
										<React.Fragment key={room._id}>
											<ListItem
												button
												selected={selectedChatId === room._id}
												onClick={() => handleChatRoomClick(room._id, room.propertyId)}
												sx={{
													p: 2,
													'&:hover': {
														backgroundColor: 'rgba(102, 126, 234, 0.08)',
													},
													'&.Mui-selected': {
														backgroundColor: 'rgba(102, 126, 234, 0.15)',
														borderLeft: '4px solid #667eea',
													},
													borderLeft: room.unreadCountForUser > 0 ? '4px solid #667eea' : '4px solid transparent',
												}}
											>
												<ListItemAvatar sx={{ mr: 2 }}>
													<Badge
														badgeContent={room.unreadCountForUser}
														color="error"
														max={99}
														overlap="circular"
														sx={{
															'& .MuiBadge-badge': {
																backgroundColor: getUnreadCountColor(room.unreadCountForUser),
																fontWeight: 'bold'
															}
														}}
													>
														<Avatar
															src={room.propertyTitle && room.propertyTitle.trim() !== '' ? undefined : undefined}
															alt={room.propertyTitle || '매물'}
															sx={{ 
																width: 50, 
																height: 50,
																border: '2px solid #e3f2fd',
																bgcolor: 'primary.main'
															}}
														>
															<Business sx={{ fontSize: 24 }} />
														</Avatar>
													</Badge>
												</ListItemAvatar>

												<ListItemText
													primary={
														<Box display="flex" alignItems="center" gap={1} mb={0.5}>
															<Typography variant="subtitle1" component="span" fontWeight="bold" color="text.primary" noWrap>
																{room.propertyTitle}
															</Typography>
															{room.unreadCountForUser > 0 && (
																<Chip
																	label={room.unreadCountForUser}
																	color="error"
																	size="small"
																	sx={{ 
																		borderRadius: 1,
																		fontWeight: 'bold',
																		backgroundColor: getUnreadCountColor(room.unreadCountForUser),
																		minWidth: 20,
																		height: 20,
																		fontSize: '0.7rem'
																	}}
																/>
															)}
														</Box>
													}
													secondary={
														<Box>
															<Typography variant="body2" color="text.secondary" fontWeight="medium" noWrap>
																{room.agentNickname || '담당자 미배정'}
															</Typography>
															{room.lastMessageContent && (
																<Typography variant="caption" color="text.secondary" noWrap>
																	{room.lastMessageContent.length > 40
																		? room.lastMessageContent.substring(0, 40) + '...'
																		: room.lastMessageContent}
																</Typography>
															)}
														</Box>
													}
												/>
											</ListItem>
											{index < filteredRooms.length - 1 && (
												<Divider sx={{ mx: 2, opacity: 0.3 }} />
											)}
										</React.Fragment>
									))}
								</List>
							)}
						</Box>
					</Paper>
				</Grid>

				{/* 오른쪽 채팅창 */}
				<Grid item xs={12} md={8} lg={9} sx={{ height: '100%', p: 2 }}>
					<Paper 
						elevation={8} 
						sx={{ 
							height: '100%',
							borderRadius: 3,
							overflow: 'hidden',
							background: 'rgba(255, 255, 255, 0.95)',
							backdropFilter: 'blur(10px)',
							display: 'flex',
							flexDirection: 'column'
						}}
					>
						{selectedChatId && selectedPropertyId && !messagesError ? (
							<>
								{/* 채팅방 헤더 */}
								<Box 
									sx={{ 
										p: 3, 
										borderBottom: '1px solid rgba(0,0,0,0.1)',
										background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
										color: 'white'
									}}
								>
									<Box display="flex" alignItems="center" gap={2}>
										<Box sx={{ flex: 1 }}>
											<Box display="flex" alignItems="center" gap={2}>
												<Avatar
													src={undefined}
													alt={filteredRooms.find(r => r._id === selectedChatId)?.propertyTitle || '매물'}
													sx={{ 
														width: 50, 
														height: 50,
														border: '2px solid rgba(255,255,255,0.3)',
														bgcolor: 'rgba(255,255,255,0.2)'
													}}
												>
													<Business sx={{ fontSize: 24 }} />
												</Avatar>
												<Box>
													<Typography variant="h6" fontWeight="bold">
														{filteredRooms.find(r => r._id === selectedChatId)?.propertyTitle || '알 수 없는 매물'}
													</Typography>
													<Typography variant="body2" sx={{ opacity: 0.9 }}>
														{filteredRooms.find(r => r._id === selectedChatId)?.agentNickname || '담당자 미배정'}
													</Typography>
												</Box>
											</Box>
										</Box>
										
										{/* 연결 상태 표시 */}
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Box
												sx={{
													width: 8,
													height: 8,
													borderRadius: '50%',
													backgroundColor: wsConnected ? '#4caf50' : '#f44336',
													animation: wsConnected ? 'pulse 2s infinite' : 'none',
													'@keyframes pulse': {
														'0%': { opacity: 1 },
														'50%': { opacity: 0.5 },
														'100%': { opacity: 1 },
													},
												}}
											/>
											<Typography variant="caption" sx={{ opacity: 0.8 }}>
												{wsConnected ? '실시간 연결됨' : '연결 끊어짐'}
											</Typography>
										</Box>
									</Box>
								</Box>

								{/* 채팅 메시지 영역 */}
								<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
									{/* 메시지 목록 */}
									<Box 
										data-message-container
										sx={{ 
											flex: 1, 
											p: 2, 
											overflow: 'auto', 
											overflowX: 'hidden',
											maxHeight: '60vh',
											display: 'flex',
											flexDirection: 'column',
											justifyContent: 'flex-end', // 메시지를 아래쪽부터 표시
											alignItems: 'flex-end', // 메시지를 오른쪽으로 정렬
											gap: 1,
											textAlign: 'right'
										}}
									>
										{messagesLoading ? (
											<Box display="flex" justifyContent="center" alignItems="center" height="100%">
												<CircularProgress />
											</Box>
										) : messagesError ? (
											<Box 
												display="flex" 
												justifyContent="center" 
												alignItems="center" 
												height="100%"
												flexDirection="column"
												gap={2}
											>
												<ChatBubble sx={{ fontSize: 40, color: 'error.main', opacity: 0.5 }} />
												<Typography variant="body1" color="error.main" textAlign="center">
													{t('Failed to load chat room')}
												</Typography>
												<Typography variant="body2" color="text.secondary" textAlign="center">
													{t('Start a new conversation')}
												</Typography>
												{selectedPropertyId && (
													<Button
														variant="contained"
														onClick={() => createChatRoomForProperty(selectedPropertyId)}
														sx={{ mt: 1 }}
													>
														{t('New Chat')}
													</Button>
												)}
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
												<ChatBubble sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5 }} />
												<Typography variant="body1" color="text.secondary" textAlign="center">
													{t('No messages')}<br />
													{t('Send Message')}
												</Typography>
											</Box>
										) : (
											<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
												{messages.map((message, index) => {
													const isUser = String(message.senderId) === String(userId);
													return (
														<Box
															key={message._id || index}
															className={isUser ? 'user-message' : 'agent-message'}
															sx={{
																display: 'flex',
																justifyContent: 'flex-end',
																mb: 1,
																alignItems: 'flex-end',
																alignSelf: 'flex-end',
																width: '100%'
															}}
														>
															<Box
																sx={{
																	maxWidth: '65%',
																	padding: '12px 16px',
																	borderRadius: '18px 18px 4px 18px',
																	background: isUser ? 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)' : 'white',
																	color: isUser ? 'white' : '#333',
																	wordBreak: 'break-word',
																	boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
																	alignSelf: 'flex-end',
																	width: 'fit-content',
																	minWidth: 'fit-content',
																	marginLeft: 'auto',
																	marginRight: '0'
																}}
															>
																<Typography variant="body2" sx={{ 
																	fontSize: '0.95rem', 
																	lineHeight: 1.4,
																	textAlign: 'right'
																}}>
																	{message.content}
																</Typography>
																<Typography variant="caption" sx={{ 
																	opacity: 0.7, 
																	mt: 0.5, 
																	display: 'block',
																	fontSize: '0.75rem',
																	textAlign: 'right'
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
									</Box>

									{/* 타이핑 상태 표시 */}
									{typingUsers.length > 0 && (
										<Box sx={{ p: 1, px: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
											<Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
												{typingUsers.length === 1 ? t('Typing') : `${typingUsers.length} ${t('Typing')}`}
											</Typography>
										</Box>
									)}

									{/* 메시지 입력 영역 */}
									<Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
											<Tooltip title="메시지 새로고침">
												<IconButton
													onClick={() => refetchMessages()}
													size="small"
													sx={{ 
														bgcolor: 'grey.100',
														'&:hover': { bgcolor: 'grey.200' }
													}}
												>
													<Refresh sx={{ fontSize: 16 }} />
												</IconButton>
											</Tooltip>
											
											<Tooltip title="메시지 조회 문제 진단">
												<IconButton
													onClick={diagnoseMessageIssue}
													size="small"
													sx={{ 
														bgcolor: 'warning.light',
														color: 'white',
														'&:hover': { bgcolor: 'warning.main' }
													}}
												>
													<Search sx={{ fontSize: 16 }} />
												</IconButton>
											</Tooltip>
										</Box>
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
											<TextField
												fullWidth
												multiline
												maxRows={4}
												value={messageInput}
												onChange={handleTyping}
												onKeyPress={handleKeyPress}
												placeholder={messagesError ? t('Failed to load chat room') : t('Type a message')}
												variant="outlined"
												size="small"
												disabled={!!messagesError}
												sx={{
													'& .MuiOutlinedInput-root': {
														borderRadius: 2,
													},
												}}
											/>
											<IconButton
												onClick={handleSendMessage}
												disabled={!messageInput.trim() || sendingMessage || !!messagesError}
												sx={{
													background: messageInput.trim() ? 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)' : '#e0e0e0',
													color: 'white',
													'&:hover': {
														background: messageInput.trim() ? 'linear-gradient(135deg, #FF6B00 0%, #FF4500 100%)' : '#e0e0e0',
													},
													'&:disabled': { 
														background: '#e0e0e0',
														color: '#999'
													}
												}}
											>
												{sendingMessage ? <CircularProgress size={20} color="inherit" /> : <Send />}
											</IconButton>
										</Box>
									</Box>
								</Box>
							</>
						) : (
							<Box 
								display="flex" 
								justifyContent="center" 
								alignItems="center" 
								height="100%"
								flexDirection="column"
								gap={2}
							>
								<ChatBubble sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />
								<Typography variant="h5" color="text.secondary" fontWeight="bold">
									{t('Select a chat room')}
								</Typography>
								<Typography variant="body1" color="text.secondary">
									{t('Select a chat room to start conversation')}
								</Typography>
							</Box>
						)}
					</Paper>
				</Grid>
			</Grid>
		</Container>
	);
};

export default LayoutBasic(ChatListPage);

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale || 'ko', ['common'])),
		},
	};
};
