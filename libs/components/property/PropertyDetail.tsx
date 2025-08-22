import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PROPERTY } from '../../../apollo/user/query';
import UnifiedChatLayout from '../chat/UnifiedChatLayout';
import { RelatedProperties } from './RelatedProperties';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sweetMixinSuccessAlert } from '../../sweetAlert';

interface PropertyDetailProps {
	propertyId: string;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ propertyId }) => {
	const { isMobile } = useDeviceDetect();
	const [showWebChat, setShowWebChat] = useState(false);

	const { data, loading, error } = useQuery(GET_PROPERTY, {
		variables: { input: propertyId }
	});

	if (loading) {
		return <div className="loading">로딩중...</div>;
	}

	if (error || !data?.getProperty) {
		return <div className="error">매물 정보를 불러올 수 없습니다.</div>;
	}

	const property = data.getProperty;



	const handleWebChatClose = () => {
		setShowWebChat(false);
	};

	return (
		<div className="property-detail">
			{/* 매물 이미지 갤러리 */}
			{property.propertyImages && property.propertyImages.length > 0 && (
				<div className="property-gallery">
					<img
						src={property.propertyImages[0]}
						alt={property.propertyTitle}
						className="main-image"
					/>
					{property.propertyImages.length > 1 && (
						<div className="image-grid">
							{property.propertyImages.slice(1, 4).map((image, index) => (
								<img
									key={index}
									src={image}
									alt={`${property.propertyTitle} ${index + 2}`}
									className="thumbnail"
								/>
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

			{/* 웹 채팅 섹션 */}
			<div className="inquiry-section">
				<button
					onClick={() => setShowWebChat(true)}
					className="inquiry-btn"
				>
					이 매물에 채팅으로 문의하기
				</button>
			</div>

			{/* 플로팅 웹 채팅 버튼 */}
			<button
				onClick={() => setShowWebChat(true)}
				className="floating-inquiry-btn"
				title="웹 채팅으로 문의하기"
			>
				💬
			</button>

			{/* 웹 채팅 */}
			{showWebChat && (
				<UnifiedChatLayout
					propertyId={propertyId}
					onBack={() => setShowWebChat(false)}
				/>
			)}

			{/* 다른 매물 둘러보기 */}
			<RelatedProperties currentPropertyId={propertyId} />
		</div>
	);
}; 