import { NextRequest, NextResponse } from 'next/server';
import { TokenResponse, ProfileResponse } from './consts';
import fetch from 'node-fetch'; 
import { LinkedinAuthDto, UserAuthResponseStatusEnum as UserStatus} from '@/sdk';
import NestApi from "@/api";

// Define the response type from our backend
interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
  };
}

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
      const profileResponse = await fetch(process.env.LINKEDIN_USER_INFO_URL as string, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // console.log(accessToken);
      // console.log(profileResponse);

      const profileData : ProfileResponse = await profileResponse.json() as ProfileResponse;

      const linkedinAuthData: LinkedinAuthDto = {
          personId: profileData.sub,
          firstName: profileData.given_name,
          lastName: profileData.family_name,
          institutionalEmail: profileData.email,
          profilePictureUrl: profileData.picture,
      } 
      
      try {
        const authResponse = await NestApi.userControllerLinkedinAuth({ linkedinAuthDto: linkedinAuthData });

        // Did we find a match?
        // Nope
        if (authResponse.status === UserStatus.Unmatched) {
          // Let's redirect to the LinkedIn confirm page
          // With the personId in the params 
          return NextResponse.redirect(new URL('/auth/linkedin-confirm/' + authResponse.personId, process.env.NEXT_PUBLIC_APP_URL).toString());
        }

        // Create a redirect response
        const redirectUrl = new URL('/analytics', process.env.NEXT_PUBLIC_APP_URL).toString();
        const responseRedirect = NextResponse.redirect(redirectUrl);
        
        // Set the token in a cookie
        // Safe to assert on the accessToken as we know the user is matched
        responseRedirect.cookies.set('auth_token', authResponse.accessToken!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24, // 1 day
          path: '/',
        });
        
        // Set user data in a cookie (non-sensitive information)
        responseRedirect.cookies.set('user', JSON.stringify(authResponse.user), {
          httpOnly: false, // Allow JavaScript access
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24, // 1 day
          path: '/',
        });
        
        return responseRedirect;
      } catch (error) {
        console.error('Error authenticating with backend:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: tokenData.error_description || 'Failed to get access token' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error exchanging authorization code:', error);
    return NextResponse.json({ error: 'Error exchanging authorization code' }, { status: 500 });
  }
}
