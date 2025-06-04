import { cleanWebsiteUrl, sanitizeLinkedinUrl } from './string';

describe('cleanWebsiteUrl', () => {
  it('returns null for empty value', () => {
    expect(cleanWebsiteUrl('')).toBeNull();
  });

  it('removes query params and normalizes url', () => {
    const input = 'http://www.example.com/path?query=1';
    const expected = 'https://example.com/path/';
    expect(cleanWebsiteUrl(input)).toBe(expected);
  });

  it('adds https and trailing slash', () => {
    expect(cleanWebsiteUrl('example.com')).toBe('https://example.com/');
  });
});

describe('sanitizeLinkedinUrl', () => {
  it('normalizes linkedin domain and ensures https', () => {
    const input = 'http://pt.linkedin.com/in/test';
    const expected = 'https://linkedin.com/in/test/';
    expect(sanitizeLinkedinUrl(input)).toBe(expected);
  });

  it('returns the same value when empty', () => {
    expect(sanitizeLinkedinUrl('')).toBe('');
  });
});
