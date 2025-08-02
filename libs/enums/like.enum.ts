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

export enum LikeGroup {
	MEMBER = 'MEMBER',
	PROPERTY = 'PROPERTY',
	ARTICLE = 'ARTICLE',
}

if (registerEnumType) {
	registerEnumType(LikeGroup, {
		name: 'LikeGroup',
	});
}
