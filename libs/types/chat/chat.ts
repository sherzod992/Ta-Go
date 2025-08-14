export interface ChatMessage {
	_id: string;
	chatId: string;
	senderId: string;
	senderType: 'USER' | 'AGENT';
	content: string;
	timestamp: string;
	isRead: boolean;
	readAt?: string;
}

export interface ChatRoom {
	_id: string;
	propertyId: string;
	userId: string;
	agentId?: string;
	status: 'ACTIVE' | 'CLOSED' | 'PENDING';
	unreadCount: {
		userId: number;
		agentId: number;
	};
	lastMessage?: string;
	propertyData?: {
		_id: string;
		propertyTitle: string;
		propertyPrice: number;
		propertyBrand: string;
		propertyModel: string;
		propertyImages: string[];
	};
	userData?: {
		memberNick: string;
		memberFullName: string;
		memberImage?: string;
		memberEmail?: string;
		memberPhone?: string;
	};
	agentData?: {
		memberNick: string;
		memberFullName: string;
		memberImage?: string;
		memberEmail?: string;
		memberPhone?: string;
	};
}

export interface ChatListResponse {
	list: ChatRoom[];
	totalUnreadCount: number;
}

export interface ChatMessagesResponse {
	list: ChatMessage[];
	metaCounter: {
		total: number;
	};
}

export interface UnreadCountResponse {
	totalUnreadCount: number;
}
