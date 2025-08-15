export interface CreateChatRoomInput {
	roomType: string;
	agentId?: string;
	propertyId: string;
	userId?: string;
}

export interface SendMessageInput {
	roomId: string;
	content: string;
}

export interface ChatRoomQueryInput {
	agentId?: string;
	status?: 'ACTIVE' | 'CLOSED' | 'PENDING';
	page?: number;
	limit?: number;
}

export interface ChatMessagesQueryInput {
	roomId: string;
	page?: number;
	limit?: number;
}

export interface MarkMessagesReadInput {
	roomId: string;
	userId: string;
}

export interface MarkAsReadInput {
	roomId: string;
}

export interface UpdateChatStatusInput {
	roomId: string;
	status: 'ACTIVE' | 'CLOSED' | 'PENDING';
	agentId?: string;
}

// 백엔드 개선 사항에 따라 추가된 새로운 입력 타입들
export interface CheckChatRoomExistsInput {
	roomId: string;
}

export interface GetAllUserChatRoomsInput {
	userId: string;
}

// 메시지 조회 문제 진단을 위한 새로운 입력 타입들
export interface GetChatRoomMessagesInput {
	roomId: string;
}

export interface GetMessageDebugInfoInput {
	roomId: string;
}
