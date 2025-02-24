import { NextRequest, NextResponse } from 'next/server';
import { TokenResponse, ProfileResponse } from './consts';
import fetch from 'node-fetch'; 


export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return NextResponse.json({ error: 'Authorization code or state missing' }, { status: 400 });
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code as string,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI as string,
    client_id: process.env.LINKEDIN_CLIENT_ID as string,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET as string,
  });

  try {
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const tokenData: TokenResponse = await tokenResponse.json() as TokenResponse;

    if (tokenResponse.ok) {
      const accessToken = tokenData.access_token;

      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });


      const profileData: ProfileResponse = await profileResponse.json() as ProfileResponse;
      console.table(profileData);


      const redirectUrl = new URL('/', process.env.NEXT_PUBLIC_APP_URL).toString();
      const response = NextResponse.redirect(redirectUrl);
      
      return response;
    } else {
      return NextResponse.json({ error: tokenData.error_description || 'Failed to get access token' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error exchanging authorization code:', error);
    return NextResponse.json({ error: 'Error exchanging authorization code' }, { status: 500 });
  }
}