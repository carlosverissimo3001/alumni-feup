const LINKEDIN_URL_PREFIX = 'https://linkedin.com';
const LINKEDIN_URL_DOMAIN = 'linkedin.com';

export const cleanWebsiteUrl = (website_url: string) => {
  if (!website_url) {
    return null;
  }
  // Remove query parameters
  website_url = website_url.split('?')[0];

  // Ensure https and trailing slash
  website_url = ensureHttpsProtocol(website_url);
  website_url = addTrailingSlash(website_url);

  // Remove www
  website_url = website_url.replace('www.', '');

  return website_url;
};

const ensureHttpsProtocol = (url: string): string => {
  if (url.startsWith('http://')) {
    return 'https://' + url.slice(7); // Remove 'http://'
  }
  if (!url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
};

const addTrailingSlash = (url: string): string => {
  if (!url.endsWith('/')) {
    return url + '/';
  }
  return url;
};

export const sanitizeLinkedinUrl = (linkedin_url: string): string => {
  if (!linkedin_url) {
    return linkedin_url;
  }

  // Removes www and country prefixes
  if (linkedin_url.includes(LINKEDIN_URL_DOMAIN)) {
    const parts = linkedin_url.split(LINKEDIN_URL_DOMAIN);
    linkedin_url = LINKEDIN_URL_PREFIX + parts[1];
  }

  // Ensure https and trailing slash
  linkedin_url = ensureHttpsProtocol(linkedin_url);
  linkedin_url = addTrailingSlash(linkedin_url);

  return linkedin_url;
};
