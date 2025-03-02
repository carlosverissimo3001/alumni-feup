import { NextRequest, NextResponse } from 'next/server';
import { TokenResponse, ProfileResponse } from './consts';
import fetch from 'node-fetch'; 
import { authenticateWithLinkedin } from '@/hooks/auth/useAuth';
import { LinkedinAuthDto } from '@/sdk/api';


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
      
      // Here, we get the user's profile data from LinkedIn
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const profileData : ProfileResponse = await profileResponse.json() as ProfileResponse;

      const linkedinAuthData: LinkedinAuthDto = {
          person_id: profileData.sub,
          first_name: profileData.given_name,
          last_name: profileData.family_name,
          institutional_email: profileData.email,
          profile_picture_url: profileData.picture,
      } 

      try {
        await authenticateWithLinkedin(linkedinAuthData);
      } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
      }

      const redirectUrl = new URL('/', process.env.NEXT_PUBLIC_APP_URL).toString();
      const responseRedirect = NextResponse.redirect(redirectUrl);
      
      return responseRedirect;
    } else {
      return NextResponse.json({ error: tokenData.error_description || 'Failed to get access token' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error exchanging authorization code:', error);
    return NextResponse.json({ error: 'Error exchanging authorization code' }, { status: 500 });
  }
}