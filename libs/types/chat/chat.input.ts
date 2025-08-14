export interface CreateChatRoomInput {
	propertyId: string;
	userId?: string;
}

export interface SendMessageInput {
	chatId: string;
	senderId: string;
	senderType: 'USER' | 'AGENT';
	content: string;
}

export interface ChatRoomQueryInput {
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

export interface MarkMessagesReadInput {
	chatId: string;
	userId: string;
}

export interface UpdateChatStatusInput {
	chatId: string;
	status: 'ACTIVE' | 'CLOSED' | 'PENDING';
	agentId?: string;
}
