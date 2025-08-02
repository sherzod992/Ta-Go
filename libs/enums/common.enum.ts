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

export enum Message {
	SOMETHING_WENT_WRONG = 'Something went wrong!',
	NO_DATA_FOUND = 'No data found!',
	CREATE_FAILED = 'Create failed!',
	UPDATE_FAILED = 'Update failed!',
	REMOVE_FAILED = 'Remove failed!',
	UPLOAD_FAILED = 'Upload failed!',
	BAD_REQUEST = 'Bad Request',

  USED_MEMBER_NICK_OR_PHONE ='Already used member nick or phone',
	NO_MEMBER_NICK = 'No member with that member nick!',
	BLOCKED_USER = 'You have been blocked!',
	WRONG_PASSWORD = 'Wrong password, try again!',
	NOT_AUTHENTICATED = 'You are not authenticated, please login first!',
	TOKEN_NOT_EXIST = 'Bearer Token is not provided!',
	ONLY_SPECIFIC_ROLES_ALLOWED = 'Allowed only for members with specific roles!',
	NOT_ALLOWED_REQUEST = 'Not Allowed Request!',
	PROVIDE_ALLOWED_FORMAT = 'Please provide jpg, ipeg or png images!',
	SELF_SUBSCRIPTION_DENIED = 'Self subscription is denied!',
}

export enum Direction{
  ASC = 1,
  DESC= -1,
}

if (registerEnumType) {
	registerEnumType(Direction, { name: 'Direction' });
}