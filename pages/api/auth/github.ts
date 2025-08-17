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

    // GitHub OAuth 토큰 교환
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/github/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'GitHub OAuth error');
    }

    // GitHub 사용자 정보 가져오기
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();

    // GitHub 사용자 이메일 가져오기
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    let userEmail = '';
    if (emailResponse.ok) {
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((email: any) => email.primary);
      userEmail = primaryEmail ? primaryEmail.email : userData.email || '';
    }

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
            memberAuthType: 'GITHUB',
            socialToken: tokenData.access_token,
            socialProvider: 'github',
            socialId: userData.id.toString(),
            memberNick: userData.login,
            memberFullName: userData.name || userData.login,
            memberImage: userData.avatar_url || '',
            memberEmail: userEmail,
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
    console.error('GitHub auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
