import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_MY_CHAT_ROOMS } from '../../../apollo/user/query';
import { ChatRoom } from '../../../libs/types/chat/chat';
import { ChatRoomQueryInput } from '../../../libs/types/chat/chat.input';
import { sweetErrorAlert } from '../../../libs/sweetAlert';
import useDeviceDetect from '../../../libs/hooks/useDeviceDetect';
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
	Fade,
	Slide,
	Fab,
	Tooltip,
	AppBar,
	Toolbar,
	Drawer,
	useTheme,
	useMediaQuery
} from '@mui/material';
import { 
	Search, 
	AccessTime, 
	Person, 
	Business,
	ChatBubble,
	Add,
	FilterList,
	Sort,
	Refresh,
	MoreVert,
	Star,
	StarBorder,
	Notifications,
	NotificationsOff,
	Archive,
	Delete,
	Settings
} from '@mui/icons-material';

const ChatListPage: React.FC = () => {
	const router = useRouter();
	const { isMobile } = useDeviceDetect();
	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
	
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([]);
	const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'active' | 'archived'>('all');
	const [sortBy, setSortBy] = useState<'recent' | 'unread' | 'name'>('recent');
	const [showDrawer, setShowDrawer] = useState(false);
	const [favoriteRooms, setFavoriteRooms] = useState<Set<string>>(new Set());

	// 사용자 ID (실제로는 인증된 사용자에서 가져와야 함)
	const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

	const { data, loading, error, refetch } = useQuery(GET_MY_CHAT_ROOMS, {
		variables: {
			input: {
				page: 1,
				limit: 50
			} as ChatRoomQueryInput
		},
		pollInterval: 10000, // 10초마다 새로고침
		onError: (error) => {
			sweetErrorAlert('채팅방 목록을 불러오는데 실패했습니다.');
		}
	});

	useEffect(() => {
		if (data?.getMyChatRooms?.list) {
			let rooms = data.getMyChatRooms.list;
			
			// 필터링
			if (selectedFilter === 'unread') {
				rooms = rooms.filter((room: ChatRoom) => room.unreadCount.userId > 0);
			} else if (selectedFilter === 'active') {
				rooms = rooms.filter((room: ChatRoom) => room.status === 'ACTIVE');
			} else if (selectedFilter === 'archived') {
				rooms = rooms.filter((room: ChatRoom) => room.status === 'CLOSED');
			}
			
			// 검색
			if (searchTerm) {
				rooms = rooms.filter((room: ChatRoom) => 
					room.propertyData?.propertyTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					room.agentData?.memberFullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					room.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
				);
			}
			
			// 정렬
			rooms.sort((a: ChatRoom, b: ChatRoom) => {
				if (sortBy === 'unread') {
					return b.unreadCount.userId - a.unreadCount.userId;
				} else if (sortBy === 'name') {
					return (a.propertyData?.propertyTitle || '').localeCompare(b.propertyData?.propertyTitle || '');
				} else {
					// recent - lastMessage timestamp 기준
					return new Date(b.lastMessage || '').getTime() - new Date(a.lastMessage || '').getTime();
				}
			});
			
			setFilteredRooms(rooms);
		}
	}, [data, searchTerm, selectedFilter, sortBy]);

	const handleChatRoomClick = (chatId: string) => {
		router.push(`/mypage/chat/${chatId}`);
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

	const formatPrice = (price?: number) => {
		if (!price) return '';
		return price.toLocaleString() + '원';
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

	return (
		<Box sx={{ 
			maxWidth: 1200, 
			margin: '0 auto', 
			padding: isMobile ? 1 : 3,
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
						총 {filteredRooms.length}개의 채팅방
						{data?.getMyChatRooms?.totalUnreadCount > 0 && (
							<span style={{ 
								color: '#ffeb3b', 
								fontWeight: 'bold',
								marginLeft: 8
							}}>
								({data.getMyChatRooms.totalUnreadCount}개 읽지 않음)
							</span>
						)}
					</Typography>
				</Box>

				{/* 검색 및 필터 */}
				<Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
					<TextField
						fullWidth={isSmallScreen}
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
							flex: 1,
							'& .MuiOutlinedInput-root': {
								borderRadius: 2,
								'&:hover fieldset': {
									borderColor: 'primary.main',
								},
							},
						}}
					/>
					
					<Box sx={{ display: 'flex', gap: 1 }}>
						<Tooltip title="필터">
							<IconButton 
								onClick={() => setShowDrawer(true)}
								sx={{ 
									bgcolor: 'primary.main', 
									color: 'white',
									'&:hover': { bgcolor: 'primary.dark' }
								}}
							>
								<FilterList />
							</IconButton>
						</Tooltip>
						
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
					<Fab 
						variant="extended" 
						color="primary"
						onClick={() => router.push('/property')}
						sx={{ 
							borderRadius: 3,
							px: 3,
							py: 1.5
						}}
					>
						<Add sx={{ mr: 1 }} />
						매물 둘러보기
					</Fab>
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
							<Fade in={true} timeout={300 + index * 100} key={room._id}>
								<React.Fragment>
									<ListItem
										button
										onClick={() => handleChatRoomClick(room._id)}
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
											borderLeft: room.unreadCount.userId > 0 ? '4px solid #667eea' : '4px solid transparent',
										}}
									>
										<ListItemAvatar sx={{ mr: 2 }}>
											<Badge
												badgeContent={room.unreadCount.userId}
												color="error"
												max={99}
												overlap="circular"
												sx={{
													'& .MuiBadge-badge': {
														backgroundColor: getUnreadCountColor(room.unreadCount.userId),
														fontWeight: 'bold'
													}
												}}
											>
												<Avatar
													src={room.propertyData?.propertyImages?.[0]}
													alt={room.propertyData?.propertyTitle}
													sx={{ 
														width: 60, 
														height: 60,
														border: '2px solid #e3f2fd'
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
														{room.propertyData?.propertyTitle}
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
													{room.unreadCount.userId > 0 && (
														<Chip
															label={`${room.unreadCount.userId}개 새 메시지`}
															color="error"
															size="small"
															sx={{ 
																borderRadius: 1,
																fontWeight: 'bold',
																backgroundColor: getUnreadCountColor(room.unreadCount.userId)
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
															{room.agentData?.memberFullName || '담당자 미배정'}
														</Typography>
													</Box>
													{room.propertyData?.propertyPrice && (
														<Typography variant="body1" color="primary.main" fontWeight="bold" sx={{ mb: 1 }}>
															{formatPrice(room.propertyData.propertyPrice)}
														</Typography>
													)}
													{room.lastMessage && (
														<Box display="flex" alignItems="center" gap={1}>
															<AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
															<Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
																{room.lastMessage.length > 60
																	? room.lastMessage.substring(0, 60) + '...'
																	: room.lastMessage}
															</Typography>
															<Typography variant="caption" color="text.secondary" fontWeight="medium">
																{formatTime(room.lastMessage)}
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
							</Fade>
						))}
					</List>
				</Paper>
			)}

			{/* 필터 드로어 */}
			<Drawer
				anchor="right"
				open={showDrawer}
				onClose={() => setShowDrawer(false)}
				PaperProps={{
					sx: {
						width: 300,
						p: 3,
						background: 'rgba(255, 255, 255, 0.95)',
						backdropFilter: 'blur(10px)'
					}
				}}
			>
				<Typography variant="h6" gutterBottom fontWeight="bold">
					필터 및 정렬
				</Typography>
				
				<Box sx={{ mb: 3 }}>
					<Typography variant="subtitle2" gutterBottom fontWeight="bold">
						상태별 필터
					</Typography>
					{['all', 'unread', 'active', 'archived'].map((filter) => (
						<Chip
							key={filter}
							label={filter === 'all' ? '전체' : filter === 'unread' ? '읽지 않음' : filter === 'active' ? '진행중' : '보관됨'}
							onClick={() => setSelectedFilter(filter as any)}
							color={selectedFilter === filter ? 'primary' : 'default'}
							sx={{ m: 0.5 }}
						/>
					))}
				</Box>
				
				<Box>
					<Typography variant="subtitle2" gutterBottom fontWeight="bold">
						정렬 기준
					</Typography>
					{['recent', 'unread', 'name'].map((sort) => (
						<Chip
							key={sort}
							label={sort === 'recent' ? '최신순' : sort === 'unread' ? '읽지 않음순' : '이름순'}
							onClick={() => setSortBy(sort as any)}
							color={sortBy === sort ? 'primary' : 'default'}
							sx={{ m: 0.5 }}
						/>
					))}
				</Box>
			</Drawer>
		</Box>
	);
};

export default LayoutBasic(ChatListPage);
