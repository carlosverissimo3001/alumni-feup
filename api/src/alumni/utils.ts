import { PORTUGUESE_NAME_CONNECTORS } from './consts';
import { NameDto } from './dto/name-dto';


/**
 * Removes accents (diacritics) from a string
 * @param str The string to remove accents from
 * @returns The string without accents
 */
export const removeAccents = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Parses the name parts from a full name string
 * @param fullName - The full name to parse
 * @returns The parsed name parts, name object with firstName, lastName and fullName
 */
export const parseNameParts = (fullName: string): NameDto => {
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

    const name: NameDto = {
      firstName: removeAccents(firstName),
      lastName: removeAccents(lastName),
      fullName: removeAccents(fullName),
    };

    return name;
  }

  // Note: I don't think this will ever happen, but just in case
  const unaccented = removeAccents(nameParts[0]);
  return {
    firstName: unaccented,
    lastName: unaccented,
    fullName: unaccented,
  };
};
