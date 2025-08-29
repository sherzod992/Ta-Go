import decodeJWT from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { sweetMixinErrorAlert } from '../types/sweetAlert';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';
import { AuthProvider, MemberRole, MemberType } from '../enums/member.enum';
import { safeLogout } from '../utils/security';

// Export AuthProvider for use in components
export { AuthProvider, MemberRole, MemberType };
// Backward compatibility alias
export { AuthProvider as MemberAuthType };

// 인증 관련 상수들
export const AUTH_CONSTANTS = {
	DEFAULT_AUTH_TYPE: AuthProvider.EMAIL,
	TOKEN_KEY: 'accessToken',
	LOGIN_TIME_KEY: 'login',
	LOGOUT_TIME_KEY: 'logout',
	DEFAULT_PROFILE_IMAGE: '/img/profile/defaultUser.svg',
} as const;

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		return localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY) ?? '';
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, token);
}

export const logIn = async (nick: string, password: string): Promise<void> => {
	try {
		const { jwtToken } = await requestJwtToken({ nick, password });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err) {
		console.warn('login err', err);
		// 로그인 실패 시에는 logOut()을 호출하지 않음 (홈페이지로 이동 방지)
		// logOut();
		throw new Error('Login Err');
	}
};

const requestJwtToken = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
		});

		console.log('---------- login ----------');
		const { accessToken } = result?.data?.login;

		return { jwtToken: accessToken };
	} catch (err: any) {
		console.log('request token err', err.graphQLErrors);
		switch (err.graphQLErrors[0].message) {
			case 'Definer: login and password do not match':
				await sweetMixinErrorAlert('아이디 또는 비밀번호가 올바르지 않습니다.\n\n다시 한 번 확인해주세요.');
				break;
			case 'Definer: user has been blocked!':
				await sweetMixinErrorAlert('계정이 차단되었습니다.\n\n관리자에게 문의해주세요.');
				break;
			default:
				await sweetMixinErrorAlert('로그인에 실패했습니다.\n\n아이디와 비밀번호를 다시 확인해주세요.');
				break;
		}
		throw new Error('token error');
	}
};

export const signUp = async (nick: string, password: string, contactInfo: string, authType: AuthProvider, memberType: MemberType = MemberType.USER): Promise<void> => {
	try {
		const { jwtToken } = await requestSignUpJwtToken({ nick, password, contactInfo, authType, memberType });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err) {
		console.warn('signup err', err);
		logOut();
		throw new Error('Signup Err');
	}
};

const requestSignUpJwtToken = async ({
	nick,
	password,
	contactInfo,
	authType,
	memberType,
}: {
	nick: string;
	password: string;
	contactInfo: string;
	authType: AuthProvider;
	memberType: MemberType;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		// 인증 타입에 따라 적절한 필드 설정
		const input: any = {
			memberNick: nick,
			memberPassword: password,
			memberType: memberType,
			memberAuthType: authType
		};

		if (authType === AuthProvider.EMAIL) {
			input.memberEmail = contactInfo;
		} else if (authType === AuthProvider.PHONE) {
			input.memberPhone = contactInfo;
		}

		console.log('Sending signup mutation with variables:', input);
		
		const result = await apolloClient.mutate({
			mutation: SIGN_UP,
			variables: { input },
			fetchPolicy: 'network-only',
		});

		console.log('---------- signup result ----------');
		console.log('Full result:', result);
		console.log('Data:', result?.data);
		console.log('Signup data:', result?.data?.signup);
		
		// accessToken이 있는지 확인
		if (!result?.data?.signup?.accessToken) {
			throw new Error('회원가입 후 토큰을 받지 못했습니다.');
		}
		
		const { accessToken } = result.data.signup;
		console.log('Access token:', accessToken);

		return { jwtToken: accessToken };
	} catch (error) {
		console.error('Signup mutation error:', error);
		throw error;
	}
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem(AUTH_CONSTANTS.LOGIN_TIME_KEY, Date.now().toString());
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	// JWT 토큰 형식 검증
	if (typeof jwtToken !== 'string' || !jwtToken.includes('.')) {
		console.warn('Invalid JWT token format:', jwtToken);
		return false;
	}

	try {
		const claims = decodeJWT<CustomJwtPayload>(jwtToken);
	userVar({
		_id: claims._id ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType ?? AUTH_CONSTANTS.DEFAULT_AUTH_TYPE,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.memberNick ?? '',
		memberFullName: claims.memberFullName ?? '',
		memberImage:
			claims.memberImage === null || claims.memberImage === undefined
				? AUTH_CONSTANTS.DEFAULT_PROFILE_IMAGE
				: `${claims.memberImage}`,
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		memberProperties: claims.memberProperties,
		memberRank: claims.memberRank,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
	});
	} catch (error) {
		console.error('JWT 토큰 디코드 실패:', error);
		return false;
	}
};

export const logOut = () => {
	deleteStorage();
	deleteUserInfo();
	// 무한 새로고침 방지를 위해 안전한 로그아웃 함수 사용
	safeLogout();
};

const deleteStorage = () => {
	localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
	window.localStorage.setItem(AUTH_CONSTANTS.LOGOUT_TIME_KEY, Date.now().toString());
};

const deleteUserInfo = () => {
	userVar({
		_id: '',
		memberType: '',
		memberStatus: '',
		memberAuthType: AUTH_CONSTANTS.DEFAULT_AUTH_TYPE,
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
		memberProperties: 0,
		memberRank: 0,
		memberArticles: 0,
		memberPoints: 0,
		memberLikes: 0,
		memberViews: 0,
		memberWarnings: 0,
		memberBlocks: 0,
	});
};

// AuthProvider 유틸리티 함수들
export const isValidAuthType = (authType: string): authType is AuthProvider => {
	return Object.values(AuthProvider).includes(authType as AuthProvider);
};

export const getAuthTypeDisplayName = (authType: AuthProvider): string => {
	switch (authType) {
		case AuthProvider.EMAIL:
		case AuthProvider.PHONE:
			return '로컬';
		case AuthProvider.GOOGLE:
			return 'Google';
		case AuthProvider.FACEBOOK:
			return 'Facebook';
		case AuthProvider.KAKAO:
			return '카카오';
		case AuthProvider.GITHUB:
			return 'GitHub';
		default:
			return '알 수 없음';
	}
};

export const isSocialAuthType = (authType: AuthProvider): boolean => {
	return [
		AuthProvider.GOOGLE,
		AuthProvider.FACEBOOK,
		AuthProvider.KAKAO,
		AuthProvider.GITHUB,
	].includes(authType);
};

export const isTraditionalAuthType = (authType: AuthProvider): boolean => {
	return [AuthProvider.EMAIL, AuthProvider.PHONE].includes(authType);
};

// 소셜 로그인 함수들
export const socialLogin = async (authType: AuthProvider, token: string): Promise<void> => {
	if (!isSocialAuthType(authType)) {
		throw new Error('Invalid social auth type');
	}

	try {
		const { jwtToken } = await requestSocialJwtToken({ authType, token });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err) {
		console.warn('social login err', err);
		// 소셜 로그인 실패 시에도 logOut()을 호출하지 않음
		// logOut();
		throw new Error('Social Login Err');
	}
};

const requestSocialJwtToken = async ({
	authType,
	token,
}: {
	authType: AuthProvider;
	token: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		// TODO: 소셜 로그인 mutation 구현 필요
		const result = await apolloClient.mutate({
			mutation: LOGIN, // 임시로 기존 LOGIN 사용
			variables: { 
				input: { 
					memberNick: '', 
					memberPassword: '',
					memberAuthType: authType,
					socialToken: token 
				} 
			},
			fetchPolicy: 'network-only',
		});

		console.log('---------- social login ----------');
		const { accessToken } = result?.data?.login;

		return { jwtToken: accessToken };
	} catch (err: any) {
		console.log('request social token err', err.graphQLErrors);
		await sweetMixinErrorAlert('소셜 로그인에 실패했습니다.');
		throw new Error('social token error');
	}
};

// 이메일 인증 함수
export const emailSignUp = async (nick: string, password: string, email: string, memberType: MemberType = MemberType.USER): Promise<void> => {
	return signUp(nick, password, email, AuthProvider.EMAIL, memberType);
};

// 전화번호 인증 함수
export const phoneSignUp = async (nick: string, password: string, phone: string, memberType: MemberType = MemberType.USER): Promise<void> => {
	return signUp(nick, password, phone, AuthProvider.PHONE, memberType);
};
