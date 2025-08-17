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

    // Facebook OAuth 토큰 교환
    const tokenResponse = await fetch('https://graph.facebook.com/v12.0/oauth/access_token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
        client_secret: process.env.FACEBOOK_APP_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/facebook/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message || 'Facebook OAuth error');
    }

    // Facebook 사용자 정보 가져오기
    const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`);

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
            memberAuthType: 'FACEBOOK',
            socialToken: tokenData.access_token,
            socialProvider: 'facebook',
            socialId: userData.id,
            memberNick: userData.email || `facebook_${userData.id}`,
            memberFullName: userData.name || 'Facebook 사용자',
            memberImage: userData.picture?.data?.url || '',
            memberEmail: userData.email || '',
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
    console.error('Facebook auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
