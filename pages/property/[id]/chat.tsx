import React from 'react';
import { useRouter } from 'next/router';
import LayoutBasic from '../../../libs/components/layout/LayoutBasic';
import UnifiedChat from '../../../libs/components/chat/UnifiedChat';

const PropertyChatPage: React.FC = () => {
	const router = useRouter();
	const { id: propertyId } = router.query;

	const handleChatCreated = (chatId: string) => {
		console.log('채팅방 생성됨:', chatId);
	};

	const handleBack = () => {
		router.back();
	};

	return (
		<UnifiedChat
			propertyId={propertyId as string}
			onChatCreated={handleChatCreated}
			onBack={handleBack}
			showHeader={true}
			showPropertyInfo={true}
		/>
	);
};

export default LayoutBasic(PropertyChatPage);
