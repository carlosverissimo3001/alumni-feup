import { Name, PORTUGUESE_NAME_CONNECTORS } from '@/consts';

/**
 * In the DB, we don't use the 'www' subdomain, so in order to match the user, we need to remove it.
 * @param url - The LinkedIn URL to sanitize
 * @returns The sanitized LinkedIn URL
 */
export const sanitizeLinkedinUrl = (url: string): string => {
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

    // If we have more than 2 parts, check if the second-to-last word is a connector
    if (nameParts.length > 2) {
      const secondToLastIndex = nameParts.length - 2;
      const lastIndex = nameParts.length - 1;

      if (
        PORTUGUESE_NAME_CONNECTORS.includes(
          nameParts[secondToLastIndex].toLowerCase(),
        )
      ) {
        lastName = `${nameParts[secondToLastIndex]} ${nameParts[lastIndex]}`;
      } else {
        lastName = nameParts[lastIndex];
      }
    } else {
      // If we only have 2 parts, the last name is the second part
      lastName = nameParts[1];
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
