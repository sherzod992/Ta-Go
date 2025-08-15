import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_AGENT_PROPERTIES } from '../../../apollo/user/query';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface RelatedPropertiesProps {
	currentPropertyId: string;
}

export const RelatedProperties: React.FC<RelatedPropertiesProps> = ({ currentPropertyId }) => {
	const { isMobile } = useDeviceDetect();
	const router = useRouter();
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [showScrollButtons, setShowScrollButtons] = useState(false);

	// 현재 매물을 제외한 다른 매물들을 가져오기
	const { data, loading, error } = useQuery(GET_AGENT_PROPERTIES, {
		variables: {
			input: {
				page: 1,
				limit: 20, // 충분한 수의 매물을 가져와서 스크롤할 수 있도록
				search: {
					propertyStatus: 'ACTIVE' // 활성 상태의 매물만
				}
			}
		}
	});

	const scrollLeft = () => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
		}
	};

	const scrollRight = () => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
		}
	};

	const handleScroll = () => {
		if (scrollContainerRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
			setShowScrollButtons(scrollWidth > clientWidth);
		}
	};

	// 컴포넌트가 마운트되고 데이터가 로드된 후 스크롤 버튼 표시 여부 확인
	useEffect(() => {
		if (data?.getAgentProperties?.list) {
			// 약간의 지연을 두어 DOM이 완전히 렌더링된 후 확인
			const timer = setTimeout(() => {
				handleScroll();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [data]);

	const handlePropertyClick = (propertyId: string) => {
		router.push(`/property/${propertyId}`);
	};

	if (loading) {
		return (
			<div className="related-properties">
				<h2>다른 매물 둘러보기</h2>
				<div className="related-properties-loading">로딩중...</div>
			</div>
		);
	}

	if (error || !data?.getAgentProperties?.list) {
		return null;
	}

	// 현재 매물을 제외한 매물들만 필터링 (이미 ACTIVE 상태만 가져왔으므로)
	const relatedProperties = data.getAgentProperties.list.filter(
		(property: any) => property._id !== currentPropertyId
	);

	if (relatedProperties.length === 0) {
		return null;
	}

	return (
		<div className="related-properties">
			<h2>다른 매물 둘러보기</h2>
			<div className="related-properties-container">
				{showScrollButtons && (
					<button className="scroll-btn scroll-left" onClick={scrollLeft}>
						‹
					</button>
				)}
				<div 
					className="related-properties-scroll"
					ref={scrollContainerRef}
					onScroll={handleScroll}
				>
					{relatedProperties.map((property: any) => (
						<div
							key={property._id}
							className="related-property-card"
							onClick={() => handlePropertyClick(property._id)}
						>
							<div className="property-image">
								{property.propertyImages && property.propertyImages.length > 0 ? (
									<img
										src={property.propertyImages[0]}
										alt={property.propertyTitle}
									/>
								) : (
									<div className="no-image">이미지 없음</div>
								)}
							</div>
							<div className="property-info">
								<h3 className="property-title">{property.propertyTitle}</h3>
								<div className="property-price">
									{property.propertyPrice.toLocaleString()}원
								</div>
								<div className="property-details">
									<span className="property-brand">{property.propertyBrand}</span>
									<span className="property-year">{property.propertyYear}년</span>
									<span className="property-mileage">
										{property.propertyMileage.toLocaleString()}km
									</span>
								</div>
								<div className="property-location">
									{property.propertyLocation}
								</div>
							</div>
						</div>
					))}
				</div>
				{showScrollButtons && (
					<button className="scroll-btn scroll-right" onClick={scrollRight}>
						›
					</button>
				)}
			</div>
		</div>
	);
};
