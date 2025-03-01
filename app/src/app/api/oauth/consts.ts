export interface TokenResponse {
    access_token: string;
    expires_in: number;
    error_description?: string;
  }

// https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2?context=linkedin%2Fconsumer%2Fcontext#response-body-schema
export interface ProfileResponse {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: {
        country: string;
        language: string;
    };
    email?: string;
    email_verified?: boolean;
}
  