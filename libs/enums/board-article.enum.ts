// 서버 사이드에서만 GraphQL 등록을 수행
let registerEnumType: any = null;

// 클라이언트 사이드에서는 registerEnumType을 사용하지 않음
if (typeof window === 'undefined') {
  try {
    const { registerEnumType: regEnumType } = require('@nestjs/graphql');
    registerEnumType = regEnumType;
  } catch (error) {
    // GraphQL 모듈이 없는 경우 무시
  }
}

export enum BoardArticleCategory {
	FREE = 'FREE',           // 자유게시판
	REVIEW = 'REVIEW',       // 리뷰게시판
	MAINTENANCE = 'MAINTENANCE', // 정비게시판
	TOURING = 'TOURING',     // 투어링게시판
	TRADE = 'TRADE',         // 중고거래게시판
	MEETING = 'MEETING',     // 모임게시판
	QNA = 'QNA',             // 질문게시판
	RECOMMEND = 'RECOMMEND', // 추천게시판
	NEWS = 'NEWS',           // 뉴스게시판
	HUMOR = 'HUMOR',         // 유머게시판
}

if (registerEnumType) {
	registerEnumType(BoardArticleCategory, {
		name: 'BoardArticleCategory',
	});
}

export enum BoardArticleStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}

if (registerEnumType) {
	registerEnumType(BoardArticleStatus, {
		name: 'BoardArticleStatus',
	});
}
