import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_PROPERTY } from '../../../apollo/user/query';
import PropertyChat from '../chat/PropertyChat';
import { RelatedProperties } from './RelatedProperties';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useChatManager } from '../../hooks/useChatManager';
import { sweetMixinSuccessAlert, sweetChatLoginConfirmAlert } from '../../sweetAlert';
import { Box, Button, useTheme, useMediaQuery, Typography, Avatar } from '@mui/material';
import { Chat as ChatIcon, Close as CloseIcon } from '@mui/icons-material';
import { ChatMessage } from '../../types/chat/chat';
import { userVar } from '../../../apollo/store';
import SkeletonUI from '../common/SkeletonUI';
import Image from 'next/image';

interface PropertyDetailProps {
	propertyId: string;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ propertyId }) => {
	const { isMobile } = useDeviceDetect();
	const theme = useTheme();
	const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
	const [showChat, setShowChat] = useState(false);
	const user = useReactiveVar(userVar);
	
	// 채팅 관리자 훅 사용
	const { addNewChatRoom, updateChatRoomWithMessage, refreshChatRooms } = useChatManager();

	const { data, loading, error } = useQuery(GET_PROPERTY, {
		variables: { input: propertyId }
	});

	if (loading) {
		return <SkeletonUI type="detail" />;
	}

	if (error || !data?.getProperty) {
		return (
			<Box sx={{ 
				display: 'flex', 
				flexDirection: 'column', 
				alignItems: 'center', 
				justifyContent: 'center', 
				height: '100vh',
				gap: 2
			}}>
				<div className="error">매물 정보를 불러올 수 없습니다.</div>
			</Box>
		);
	}

	const property = data.getProperty;

	const handleChatToggle = async () => {
		// 로그인하지 않은 사용자인 경우 확인 메시지 표시
		if (!user?._id) {
			const shouldLogin = await sweetChatLoginConfirmAlert('로그인을 먼저 하셔야 합니다.\n로그인 페이지로 이동하시겠습니까?');
			if (shouldLogin) {
				window.location.href = '/login';
			}
			return;
		}
		
		setShowChat(!showChat);
	};

	const handleChatClose = () => {
		setShowChat(false);
	};

	// 채팅방 생성 콜백
	const handleChatRoomCreated = (roomId: string) => {
		console.log('새 채팅방 생성됨:', roomId);
		
		// 채팅 목록에 새 채팅방 추가
		const newChatRoom = {
			_id: roomId,
			roomId: roomId,
			roomType: 'PROPERTY_INQUIRY',
			propertyId: propertyId,
			propertyTitle: property.propertyTitle,
			lastMessageContent: undefined,
			lastMessageTime: new Date().toISOString(),
			unreadCountForUser: 0,
			unreadCountForAgent: 0,
			userNickname: '나',
			agentNickname: property.memberData?.memberNick || '판매자',
			userId: 'current-user-id',
			agentId: property.memberData?._id,
			status: 'ACTIVE' as const,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		
		addNewChatRoom(newChatRoom);
		sweetMixinSuccessAlert('채팅방이 생성되었습니다!');
	};

	// 메시지 전송 콜백
	const handleMessageSent = (message: ChatMessage) => {
		console.log('새 메시지 전송됨:', message);
		
		// 채팅 목록의 최근 메시지 즉시 업데이트
		updateChatRoomWithMessage(message.roomId, message);
		
		// 채팅 목록 새로고침 (서버 데이터 동기화)
		refreshChatRooms();
	};

	return (
		<Box sx={{ 
			display: 'flex', 
			height: '100vh',
			overflow: 'hidden'
		}}>
			{/* 매물 정보 영역 */}
			<Box sx={{ 
				flex: showChat && isDesktop ? '0 0 60%' : '1',
				transition: 'flex 0.3s ease',
				overflow: 'auto',
				padding: 2
			}}>
				<div className="property-detail">
					{/* 매물 이미지와 상세정보를 나란히 배치 */}
					<Box sx={{ 
						display: 'flex', 
						gap: 3, 
						mb: 3,
						flexDirection: isMobile ? 'column' : 'row'
					}}>
						{/* 매물 이미지 갤러리 */}
						{property.propertyImages && property.propertyImages.length > 0 && (
							<Box sx={{ 
								flex: isMobile ? '1' : '0 0 50%',
								minWidth: isMobile ? '100%' : '400px'
							}}>
								<div className="property-gallery">
									<div className="main-image-container">
										<Image
											src={property.propertyImages[0]}
											alt={property.propertyTitle}
											width={600}
											height={450}
											className="main-image"
											quality={85}
											priority
											style={{
												width: '100%',
												height: 'auto',
												maxHeight: isMobile ? '300px' : '400px',
												objectFit: 'cover',
												borderRadius: '12px'
											}}
										/>
									</div>
									{property.propertyImages.length > 1 && (
										<div className="image-grid">
											{property.propertyImages.slice(1, 4).map((image, index) => (
												<div key={index} className="thumbnail-container">
													<Image
														src={image}
														alt={`${property.propertyTitle} ${index + 2}`}
														width={150}
														height={150}
														className="thumbnail"
														quality={85}
														style={{
															width: '100%',
															height: '100%',
															objectFit: 'cover',
															borderRadius: '8px'
														}}
													/>
												</div>
											))}
										</div>
									)}
								</div>
							</Box>
						)}

						{/* 매물 상세 정보 */}
						<Box sx={{ 
							flex: isMobile ? '1' : '0 0 50%',
							display: 'flex',
							flexDirection: 'column',
							gap: 2
						}}>
							<div className="property-info">
								<Typography variant="h4" component="h1" sx={{ 
									fontWeight: 'bold', 
									color: '#333',
									mb: 2
								}}>
									{property.propertyTitle}
								</Typography>
								<Typography variant="h5" sx={{ 
									color: '#e92C28', 
									fontWeight: 'bold',
									mb: 3
								}}>
									{property.propertyPrice.toLocaleString()}원
								</Typography>
								<Box sx={{ 
									display: 'grid', 
									gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
									gap: 2,
									mb: 3
								}}>
									<Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
										<Typography variant="body2" color="text.secondary">브랜드</Typography>
										<Typography variant="body1" fontWeight="medium">{property.propertyBrand}</Typography>
									</Box>
									<Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
										<Typography variant="body2" color="text.secondary">모델</Typography>
										<Typography variant="body1" fontWeight="medium">{property.propertyModel}</Typography>
									</Box>
									<Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
										<Typography variant="body2" color="text.secondary">연식</Typography>
										<Typography variant="body1" fontWeight="medium">{property.propertyYear}년</Typography>
									</Box>
									<Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
										<Typography variant="body2" color="text.secondary">주행거리</Typography>
										<Typography variant="body1" fontWeight="medium">{property.propertyMileage.toLocaleString()}km</Typography>
									</Box>
									<Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
										<Typography variant="body2" color="text.secondary">연료</Typography>
										<Typography variant="body1" fontWeight="medium">{property.propertyFuelType}</Typography>
									</Box>
									<Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
										<Typography variant="body2" color="text.secondary">변속</Typography>
										<Typography variant="body1" fontWeight="medium">{property.propertyTransmission}</Typography>
									</Box>
									<Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
										<Typography variant="body2" color="text.secondary">배기량</Typography>
										<Typography variant="body1" fontWeight="medium">{property.propertyEngineSize}cc</Typography>
									</Box>
									<Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
										<Typography variant="body2" color="text.secondary">색상</Typography>
										<Typography variant="body1" fontWeight="medium">{property.propertyColor}</Typography>
									</Box>
								</Box>
								<Box sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
									<Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>상세 설명</Typography>
									<Typography variant="body1" sx={{ lineHeight: 1.6 }}>
										{property.propertyDesc || '상세한 설명이 없습니다.'}
									</Typography>
								</Box>
							</div>
						</Box>
					</Box>

					{/* 매물 통계 */}
					<Box sx={{ 
						display: 'grid', 
						gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
						gap: 2,
						mb: 3,
						p: 3,
						bgcolor: '#f8f9fa',
						borderRadius: 2
					}}>
						<Box sx={{ textAlign: 'center' }}>
							<Typography variant="h4" sx={{ color: '#e92C28', fontWeight: 'bold' }}>
								{property.propertyViews}
							</Typography>
							<Typography variant="body2" color="text.secondary">조회수</Typography>
						</Box>
						<Box sx={{ textAlign: 'center' }}>
							<Typography variant="h4" sx={{ color: '#e92C28', fontWeight: 'bold' }}>
								{property.propertyLikes}
							</Typography>
							<Typography variant="body2" color="text.secondary">관심</Typography>
						</Box>
						<Box sx={{ textAlign: 'center' }}>
							<Typography variant="h4" sx={{ color: '#e92C28', fontWeight: 'bold' }}>
								{property.propertyComments}
							</Typography>
							<Typography variant="body2" color="text.secondary">댓글</Typography>
						</Box>
						<Box sx={{ textAlign: 'center' }}>
							<Typography variant="h4" sx={{ color: '#e92C28', fontWeight: 'bold' }}>
								{property.propertyRank}
							</Typography>
							<Typography variant="body2" color="text.secondary">순위</Typography>
						</Box>
					</Box>

					{/* 판매자 정보 */}
					{property.memberData && (
						<Box sx={{ 
							p: 3, 
							bgcolor: '#f8f9fa', 
							borderRadius: 2,
							mb: 3
						}}>
							<Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
								판매자 정보
							</Typography>
							<Box sx={{ 
								display: 'flex', 
								alignItems: 'center', 
								gap: 2,
								mb: 3
							}}>
								<Avatar
									src={property.memberData.memberImage || '/img/default-avatar.png'}
									alt="판매자"
									sx={{ width: 60, height: 60 }}
								/>
								<Box>
									<Typography variant="h6" sx={{ fontWeight: 'medium' }}>
										{property.memberData.memberFullName || property.memberData.memberNick}
									</Typography>
									<Typography variant="body2" sx={{ color: '#ffc107' }}>
										★★★★★ (5.0)
									</Typography>
								</Box>
							</Box>
							<Box sx={{ 
								display: 'grid', 
								gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
								gap: 2
							}}>
								<Box sx={{ textAlign: 'center' }}>
									<Typography variant="h5" sx={{ color: '#e92C28', fontWeight: 'bold' }}>
										{property.memberData.memberProperties}
									</Typography>
									<Typography variant="body2" color="text.secondary">등록 매물</Typography>
								</Box>
								<Box sx={{ textAlign: 'center' }}>
									<Typography variant="h5" sx={{ color: '#e92C28', fontWeight: 'bold' }}>
										{property.memberData.memberFollowers}
									</Typography>
									<Typography variant="body2" color="text.secondary">팔로워</Typography>
								</Box>
								<Box sx={{ textAlign: 'center' }}>
									<Typography variant="h5" sx={{ color: '#e92C28', fontWeight: 'bold' }}>
										{property.memberData.memberRank}
									</Typography>
									<Typography variant="body2" color="text.secondary">등급</Typography>
								</Box>
							</Box>
						</Box>
					)}

					{/* 채팅 문의 버튼 */}
					<Box sx={{ mb: 3 }}>
						<Button
							variant="contained"
							size="large"
							startIcon={<ChatIcon />}
							onClick={handleChatToggle}
							sx={{
								backgroundColor: '#667eea',
								'&:hover': {
									backgroundColor: '#5a6fd8'
								},
								width: '100%',
								py: 2,
								borderRadius: 2,
								fontSize: '1.1rem',
								fontWeight: 'medium'
							}}
						>
							{showChat ? '채팅 닫기' : '이 매물에 채팅으로 문의하기'}
						</Button>
					</Box>

					{/* 다른 매물 둘러보기 */}
					<RelatedProperties currentPropertyId={propertyId} />
				</div>
			</Box>

			{/* 채팅 영역 */}
			{showChat && (
				<Box sx={{ 
					flex: isDesktop ? '0 0 40%' : '1',
					borderLeft: isDesktop ? '1px solid #e0e0e0' : 'none',
					display: 'flex',
					flexDirection: 'column',
					height: '100vh'
				}}>
					<PropertyChat 
						propertyId={propertyId}
						propertyTitle={property.propertyTitle}
						onClose={handleChatClose}
						isMobile={isMobile}
						onChatRoomCreated={handleChatRoomCreated}
						onMessageSent={handleMessageSent}
					/>
				</Box>
			)}
		</Box>
	);
}; 