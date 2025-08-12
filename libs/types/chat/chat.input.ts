export interface CreateChatRoomInput {
	propertyId: string;
	userId: string;
	initialMessage: string;
}

export interface SendMessageInput {
	chatId: string;
	senderId: string;
	senderType: 'USER' | 'AGENT';
	content: string;
}

export interface ChatRoomQueryInput {
	userId?: string;
	agentId?: string;
	status?: 'ACTIVE' | 'CLOSED' | 'PENDING';
	page?: number;
	limit?: number;
}

export interface ChatMessagesQueryInput {
	chatId: string;
	page?: number;
	limit?: number;
}

export interface UpdateChatStatusInput {
	chatId: string;
	status: 'ACTIVE' | 'CLOSED' | 'PENDING';
	agentId?: string;
}
