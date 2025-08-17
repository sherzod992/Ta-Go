import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }
    // Kakao OAuth 토큰 교환
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID!,
        client_secret: process.env.KAKAO_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/kakao/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Kakao 사용자 정보 가져오기
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();

    // 백엔드로 소셜 로그인 요청
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation SocialLogin($input: SocialLoginInput!) {
            socialLogin(input: $input) {
              _id
              memberNick
              memberFullName
              memberImage
              accessToken
            }
          }
        `,
        variables: {
          input: {
            memberAuthType: 'KAKAO',
            socialToken: tokenData.access_token,
            socialProvider: 'kakao',
            socialId: userData.id.toString(),
            memberNick: userData.kakao_account?.email || `kakao_${userData.id}`,
            memberFullName: userData.properties?.nickname || '카카오 사용자',
            memberImage: userData.properties?.profile_image || '',
            memberEmail: userData.kakao_account?.email || '',
          },
        },
      }),
    });

    if (!backendResponse.ok) {
      throw new Error('Backend social login failed');
    }

    const backendData = await backendResponse.json();

    if (backendData.errors) {
      throw new Error(backendData.errors[0].message);
    }

    res.status(200).json({
      accessToken: backendData.data.socialLogin.accessToken,
      userInfo: backendData.data.socialLogin,
    });
  } catch (error) {
    console.error('Kakao auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
