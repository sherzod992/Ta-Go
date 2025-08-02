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

export enum MemberType{
    USER = "USER",
    AGENT = "AGENT",
    ADMIN = "ADMIN",
}

if (registerEnumType) {
    registerEnumType(MemberType, {
        name: "MemberType",
    });
}

export enum MemberStatus{
    ACTIVE = "ACTIVE",
    BLOCK  = "BLOCK",
    DELETED = "DELETED",
    DELATE = "DELATE", // 임시로 추가 - 기존 데이터 호환성을 위해
}

if (registerEnumType) {
    registerEnumType(MemberStatus, {
        name: "MemberStatus",
    });
}

export enum MemberAuthType {
    PHONE = "PHONE",
    EMAIL = "EMAIL",
    TELEGRAM = "TELEGRAM",
    KAKAO = "KAKAO",
    GITHUB = "GITHUB",
    FACEBOOK = "FACEBOOK",
    GOOGLE = "GOOGLE",
}

if (registerEnumType) {
    registerEnumType(MemberAuthType, {
        name: "MemberAuthType",
    });
}

