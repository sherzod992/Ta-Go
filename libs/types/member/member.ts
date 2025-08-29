import { AuthProvider, MemberStatus, MemberType } from '../../enums/member.enum';
import { MeLiked, TotalCounter } from '../property/property';
import { MeFollowed } from '../follow/follow';

export interface Member {
	_id: string;
	memberType: MemberType;
	memberStatus: MemberStatus;
	memberAuthType: AuthProvider;
	memberPhone: string;
	memberNick: string;
	memberPassword?: string;
	memberFullName?: string;
	memberImage?: string;
	memberAddress?: string;
	memberDesc?: string;
	
	// 소셜 로그인 필드들 (선택적)
	socialId?: string;
	socialProvider?: AuthProvider;
	// 민감한 토큰 정보는 제외 (보안상 필요시에만 요청)
	// socialAccessToken?: string;
	// socialRefreshToken?: string;
	// socialTokenExpiresAt?: Date;
	
	memberProperties: number;
	memberRank: number;
	memberArticles: number;
	memberPoints: number;
	memberLikes: number;
	memberFollowers?: number;
	memberFollowings?: number;
	memberViews: number;
	memberComments: number;
	memberWarnings: number;
	memberBlocks: number;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
	accessToken?: string;
}

// GraphQL 응답을 위한 타입들
export interface SignupResponse {
	success: boolean;
	message: string;
	token: string;
	refreshToken: string;
	_id: string;
	memberType: MemberType;
	memberStatus: MemberStatus;
	memberAuthType: AuthProvider;
	memberPhone: string;
	memberEmail: string;
	memberNick: string;
	memberFullName?: string;
	memberImage?: string;
	memberAddress?: string;
	memberDesc?: string;
	memberProperties: number;
	memberArticles: number;
	memberFollowers?: number;
	memberFollowings?: number;
	memberPoints: number;
	memberLikes: number;
	memberViews: number;
	memberComments: number;
	memberRank: number;
	memberWarnings: number;
	memberBlocks: number;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	accessToken: string;
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
}

export interface LoginResponse {
	success: boolean;
	message: string;
	token: string;
	refreshToken: string;
	_id: string;
	memberType: MemberType;
	memberStatus: MemberStatus;
	memberAuthType: AuthProvider;
	memberPhone: string;
	memberEmail: string;
	memberNick: string;
	memberFullName?: string;
	memberImage?: string;
	memberAddress?: string;
	memberDesc?: string;
	memberProperties: number;
	memberArticles: number;
	memberFollowers?: number;
	memberFollowings?: number;
	memberPoints: number;
	memberLikes: number;
	memberViews: number;
	memberComments: number;
	memberRank: number;
	memberWarnings: number;
	memberBlocks: number;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	accessToken: string;
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
}

export interface Members {
	list: Member[];
	metaCounter: TotalCounter[];
}
