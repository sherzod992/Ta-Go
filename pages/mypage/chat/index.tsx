import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_CHAT_ROOMS, GET_ALL_USER_CHAT_ROOMS } from '../../../apollo/user/query';
import { CREATE_CHAT_ROOM } from '../../../apollo/user/mutation';
import { ChatRoom } from '../../../libs/types/chat/chat';
import { ChatRoomQueryInput } from '../../../libs/types/chat/chat.input';
import { sweetErrorAlert } from '../../../libs/sweetAlert';
import useDeviceDetect from '../../../libs/hooks/useDeviceDetect';
import { useChatSubscriptions } from '../../../libs/hooks/useChatSubscriptions';
import withLayoutBasic from '../../../libs/components/layout/LayoutBasic';
import { useTranslation } from '../../../libs/hooks/useTranslation';
import UnifiedChatLayout from '../../../libs/components/chat/UnifiedChatLayout';
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
	Business,
	ChatBubble,
	Send,
	Refresh,
	MoreVert,
	AttachFile
} from '@mui/icons-material';

const ChatListPage: React.FC = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const { isMobile: deviceIsMobile } = useDeviceDetect();
	
	const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
	const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [isMounted, setIsMounted] = useState(false);
	const [hasError, setHasError] = useState(false);

	// 사용자 ID (실제로는 인증된 사용자에서 가져와야 함)
	const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

	// 컴포넌트 마운트 상태 관리
	useEffect(() => {
		setIsMounted(true);
		return () => setIsMounted(false);
	}, []);

	// URL에서 채팅방 ID가 있으면 선택
	useEffect(() => {
		if (router.query.chatId && typeof router.query.chatId === 'string') {
			setSelectedChatId(router.query.chatId);
		}
	}, [router.query.chatId]);

	const { data, loading, error, refetch } = useQuery(GET_MY_CHAT_ROOMS, {
		variables: {
			input: {
				userId: userId || '', 
				page: 1,
				limit: 50
			} as ChatRoomQueryInput
		},
		skip: !userId || !isMounted,
		pollInterval: 10000, // 10초마다 폴링
		onError: (error) => {
			console.error('채팅방 목록 조회 에러:', error);
				setHasError(true);
			sweetErrorAlert('채팅방 목록을 불러오는데 실패했습니다.');
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

	// 채팅방 생성
	const [createChatRoom] = useMutation(CREATE_CHAT_ROOM, {
		onError: (error) => {
			console.error('채팅방 생성 에러:', error);
				sweetErrorAlert('채팅방 생성에 실패했습니다.');
		}
	});

	// GraphQL Subscription
	const { messageSentData } = useChatSubscriptions({
		roomId: selectedChatId || undefined,
		onMessageSent: (message) => {
			console.log('새 메시지 수신:', message);
			// 채팅방 목록 새로고침
			refetch();
		},
		onTypingIndicator: (data) => {
			console.log('타이핑 상태 수신:', data);
		},
		onChatNotification: (notification) => {
			console.log('채팅 알림 수신:', notification);
		},
	});

	// 채팅방 생성 함수
	const createChatRoomForProperty = async (propertyId: string) => {
		if (!userId || !propertyId) {
			console.error('사용자 ID 또는 매물 ID가 없습니다.');
			return;
		}

		try {
			console.log('새 채팅방 생성 시작:', { propertyId, userId });
			
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
				const newRoomId = result.data.createChatRoom.roomId;
				console.log('채팅방 생성 성공:', newRoomId);
				setSelectedChatId(newRoomId);
				setSelectedPropertyId(propertyId);
				
				// 채팅방 목록 새로고침
				await refetch();
				
				if (isMobile) {
					router.push(`/mypage/chat/${newRoomId}`);
				}
			}
		} catch (error) {
			console.error('채팅방 생성 중 에러:', error);
			sweetErrorAlert('채팅방 생성에 실패했습니다.');
		}
	};

	// 채팅방 클릭 핸들러
	const handleChatRoomClick = async (chatId: string, propertyId: string) => {
		console.log('채팅방 클릭:', { chatId, propertyId });
		
		// 유효한 채팅방인지 확인
		const selectedRoom = data?.getMyChatRooms?.list?.find((r: ChatRoom) => r._id === chatId);
		if (!selectedRoom) {
			console.error('유효하지 않은 채팅방:', chatId);
			sweetErrorAlert('유효하지 않은 채팅방입니다.');
			return;
		}
		
		// 상태 업데이트
		setSelectedChatId(chatId);
		setSelectedPropertyId(propertyId);
		
		if (isMobile) {
			router.push(`/mypage/chat/${chatId}`);
		}
	};

	// 검색 필터링
	const filteredRooms = useMemo(() => {
		if (!data?.getMyChatRooms?.list) return [];
		
		return data.getMyChatRooms.list.filter((room: ChatRoom) => {
			const searchLower = searchTerm.toLowerCase();
			return (
				room.propertyTitle?.toLowerCase().includes(searchLower) ||
				room.agentNickname?.toLowerCase().includes(searchLower) ||
				room.lastMessageContent?.toLowerCase().includes(searchLower)
			);
		});
	}, [data?.getMyChatRooms?.list, searchTerm]);

	// 시간 포맷팅
	const formatTime = (createdAt: string) => {
		const date = new Date(createdAt);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
		} else if (diffInHours < 48) {
			return '어제';
		} else {
			return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
		}
	};

	// 읽지 않은 메시지 수 계산
	const getUnreadCount = (room: ChatRoom) => {
		return room.unreadCountForUser || 0;
	};

	if (loading) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
					<CircularProgress />
			</Box>
			</Container>
		);
	}

	if (error || hasError) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
				<Typography variant="h6" color="error">
						{t('Failed to load chat rooms')}
				</Typography>
					<Button variant="contained" onClick={() => refetch()}>
						{t('Retry')}
					</Button>
			</Box>
			</Container>
		);
	}

		return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Box sx={{ height: '80vh' }}>
				<UnifiedChatLayout
					initialRoomId={selectedChatId || undefined}
				/>
			</Box>
		</Container>
	);
};

export default withLayoutBasic(ChatListPage);
