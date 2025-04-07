import { PORTUGUESE_NAME_CONNECTORS, Name } from '@/consts';

/**
 * In the DB, we don't use the 'www' subdomain, so in order to match the user, we need to remove it.
 * @param url - The LinkedIn URL to sanitize
 * @returns The sanitized LinkedIn URL
 */
export const sanitizeLinkedinUrl = (url: string) => {
  const sanitizedUrl = url.replace('www.', '');
  return sanitizedUrl.endsWith('/') ? sanitizedUrl : `${sanitizedUrl}/`;
};

/**
 * Parses the name parts from a full name string
 * @param fullName - The full name to parse
 * @returns The parsed name parts, name object with firstName, lastName and fullName
 */
export const parseNameParts = (fullName: string): Name => {
  const nameParts = fullName.trim().split(' ');

  // If we have at least 2 parts
  if (nameParts.length >= 2) {
    const firstName = nameParts[0]; // First name is always first word
    let lastName: string;
    // If second-to-last word is a connector, take it with the last word
    if (
      nameParts.length > 2 &&
      PORTUGUESE_NAME_CONNECTORS.includes(nameParts[-2].toLowerCase())
    ) {
      lastName = `${nameParts[-2]} ${nameParts[-1]}`;
    } else {
      // Otherwise just take the last word
      lastName = nameParts[-1];
    }
    return {
      firstName,
      lastName,
      fullName,
    };
  }

  // Note: I don't think this will ever happen, but just in case
  return {
    firstName: nameParts[0],
    lastName: nameParts[0],
    fullName: nameParts[0],
  };
};
