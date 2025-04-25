/**
 * Filters out boolean parameters that are false from an object
 * @param params The parameters object
 * @returns A new object with false boolean values removed
 */
export const filterBooleanParams = <T extends Record<string, unknown>>(params: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (typeof value !== 'boolean') return true;
      return value === true;
    })
  ) as Partial<T>;
};

/**
 * Filters out boolean parameters that are false from API request objects
 * @param params The API request parameters
 * @returns A new object with false boolean values removed
 */
export const filterApiRequestParams = <T>(params: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(params as Record<string, unknown>).filter(([, value]) => {
      if (typeof value !== 'boolean') return true;
      return value === true;
    })
  ) as Partial<T>;
};

