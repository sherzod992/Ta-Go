import React from 'react';
import { useRouter } from 'next/router';
import LayoutBasic from '../../../libs/components/layout/LayoutBasic';
import UnifiedChatLayout from '../../../libs/components/chat/UnifiedChatLayout';

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
		<UnifiedChatLayout
			propertyId={propertyId as string}
			onBack={() => router.back()}
		/>
	);
};

export default LayoutBasic(PropertyChatPage);
