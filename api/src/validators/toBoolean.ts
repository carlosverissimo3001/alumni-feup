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
