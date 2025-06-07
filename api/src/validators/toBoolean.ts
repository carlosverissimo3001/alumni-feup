/**
 * Converts a string to a boolean
 * We need this as the parameter is passed as a string from the frontend (I believe)
 * @param value The value to convert
 * @returns The boolean value
 */
export function toBoolean(value: any): any {
  if (typeof value === 'boolean') {
    return value;
  }
  if (
    typeof value === 'string' &&
    ['true', 'false'].includes(value.toLowerCase())
  ) {
    return value.toLowerCase() === 'true';
  }
  return value;
}
