export interface ChatMessage {
	_id: string;
	chatId: string;
	senderId: string;
	senderType: 'USER' | 'AGENT';
	content: string;
	timestamp: string;
	isRead: boolean;
}

export interface ChatRoom {
	_id: string;
	propertyId: string;
	userId: string;
	agentId?: string;
	status: 'ACTIVE' | 'CLOSED' | 'PENDING';
	createdAt: string;
	updatedAt: string;
	lastMessage?: ChatMessage;
	unreadCount: number;
	propertyData?: {
		_id: string;
		propertyTitle: string;
		propertyPrice: number;
		propertyBrand: string;
		propertyModel: string;
		propertyImages: string[];
	};
	userData?: {
		_id: string;
		memberNick: string;
		memberFullName: string;
		memberImage?: string;
	};
	agentData?: {
		_id: string;
		memberNick: string;
		memberFullName: string;
		memberImage?: string;
	};
}

export interface ChatListResponse {
	list: ChatRoom[];
	metaCounter: {
		total: number;
	};
}

export interface ChatMessagesResponse {
	list: ChatMessage[];
	metaCounter: {
		total: number;
	};
}
