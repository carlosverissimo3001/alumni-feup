export const LINKEDIN_STATE = process.env.LINKEDIN_STATE;
const LINKEDIN_SCOPE = process.env.LINKEDIN_SCOPE;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;

export const getURLWithQueryParams = (base: string, params: Record<string, string>) => {
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `${base}?${query}`;
};

export const LINKEDIN_URL = getURLWithQueryParams(
  "https://www.linkedin.com/oauth/v2/authorization",
  {
    // Note: we know these are not undefined so no issue with the !
    response_type: "code",
    client_id: LINKEDIN_CLIENT_ID!,
    redirect_uri: LINKEDIN_REDIRECT_URI!,
    state: LINKEDIN_STATE!,
    scope: LINKEDIN_SCOPE!
  }
);
