import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_PROPERTY } from '../../../apollo/user/query';
import PropertyChat from '../chat/PropertyChat';
import { RelatedProperties } from './RelatedProperties';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useChatManager } from '../../hooks/useChatManager';
import { sweetMixinSuccessAlert } from '../../sweetAlert';
import { Box, Button, useTheme, useMediaQuery } from '@mui/material';
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

	const handleChatToggle = () => {
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
					{/* 매물 이미지 갤러리 */}
					{property.propertyImages && property.propertyImages.length > 0 && (
						<div className="property-gallery">
							<div className="main-image-container">
								<Image
									src={property.propertyImages[0]}
									alt={property.propertyTitle}
									width={800}
									height={600}
									className="main-image"
									quality={85}
									priority
									style={{
										width: '100%',
										height: 'auto',
										maxHeight: '500px',
										objectFit: 'cover',
										borderRadius: '8px'
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
												width={200}
												height={150}
												className="thumbnail"
												quality={85}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
													borderRadius: '4px'
												}}
											/>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{/* 매물 상세 정보 */}
					<div className="property-info">
						<h1>{property.propertyTitle}</h1>
						<div className="property-price">
							{property.propertyPrice.toLocaleString()}원
						</div>
						<div className="property-details">
							<p data-label="브랜드:">{property.propertyBrand}</p>
							<p data-label="모델:">{property.propertyModel}</p>
							<p data-label="연식:">{property.propertyYear}년</p>
							<p data-label="주행거리:">{property.propertyMileage.toLocaleString()}km</p>
							<p data-label="연료:">{property.propertyFuelType}</p>
							<p data-label="변속:">{property.propertyTransmission}</p>
							<p data-label="배기량:">{property.propertyEngineSize}cc</p>
							<p data-label="색상:">{property.propertyColor}</p>
						</div>
						<div className="property-description">
							{property.propertyDesc || '상세한 설명이 없습니다.'}
						</div>
					</div>

					{/* 매물 통계 */}
					<div className="property-stats">
						<div className="stat-item">
							<div className="stat-number">{property.propertyViews}</div>
							<div className="stat-label">조회수</div>
						</div>
						<div className="stat-item">
							<div className="stat-number">{property.propertyLikes}</div>
							<div className="stat-label">관심</div>
						</div>
						<div className="stat-item">
							<div className="stat-number">{property.propertyComments}</div>
							<div className="stat-label">댓글</div>
						</div>
						<div className="stat-item">
							<div className="stat-number">{property.propertyRank}</div>
							<div className="stat-label">순위</div>
						</div>
					</div>

					{/* 판매자 정보 */}
					{property.memberData && (
						<div className="seller-info">
							<div className="seller-header">
								<img
									src={property.memberData.memberImage || '/img/default-avatar.png'}
									alt="판매자"
									className="seller-avatar"
								/>
								<div className="seller-details">
									<h3>{property.memberData.memberFullName || property.memberData.memberNick}</h3>
									<div className="seller-rating">★★★★★ (5.0)</div>
								</div>
							</div>
							<div className="seller-stats">
								<div className="stat">
									<div className="number">{property.memberData.memberProperties}</div>
									<div className="label">등록 매물</div>
								</div>
								<div className="stat">
									<div className="number">{property.memberData.memberFollowers}</div>
									<div className="label">팔로워</div>
								</div>
								<div className="stat">
									<div className="number">{property.memberData.memberRank}</div>
									<div className="label">등급</div>
								</div>
							</div>
						</div>
					)}

					{/* 채팅 문의 버튼 - 개발 중에는 항상 표시 */}
					<div className="inquiry-section">
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
								py: 1.5
							}}
						>
							{showChat ? '채팅 닫기' : '이 매물에 채팅으로 문의하기'}
						</Button>
					</div>

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