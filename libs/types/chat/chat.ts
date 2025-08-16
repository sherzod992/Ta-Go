export interface ChatMessage {
	_id: string;
	messageId: string;
	roomId: string;
	senderId: string;
	messageType: string;
	content: string;
	status: string;
	senderNickname?: string;
	senderAvatar?: string;
	isAgent: boolean; // non-nullable 필드
	isEdited: boolean; // non-nullable 필드
	isDeleted: boolean; // non-nullable 필드
	isPinned: boolean; // non-nullable 필드
	isSystem: boolean; // non-nullable 필드
	createdAt: string;
	updatedAt: string;
}

export interface ChatRoom {
	_id: string;
	roomId: string;
	roomType: string;
	userId: string;
	agentId?: string;
	propertyId: string;
	status: 'ACTIVE' | 'CLOSED' | 'PENDING';
	lastMessageContent?: string;
	lastMessageSenderId?: string;
	lastMessageTime?: string;
	unreadCountForUser: number;
	unreadCountForAgent: number;
	propertyTitle: string;
	userNickname: string;
	agentNickname?: string;
	createdAt: string;
	updatedAt: string;
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
