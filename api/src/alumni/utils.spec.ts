import { sanitizeLinkedinUrl, removeAccents, parseNameParts } from './utils';

describe('sanitizeLinkedinUrl', () => {
  it('removes www subdomain and ensures trailing slash', () => {
    expect(sanitizeLinkedinUrl('https://www.linkedin.com/in/test')).toBe(
      'https://linkedin.com/in/test/'
    );
  });
});

describe('removeAccents', () => {
  it('strips diacritics from string', () => {
    expect(removeAccents('José Álvaro')).toBe('Jose Alvaro');
  });
});

describe('parseNameParts', () => {
  it('parses names with connectors', () => {
    expect(parseNameParts('João da Silva')).toEqual({
      firstName: 'Joao',
      lastName: 'da Silva',
      fullName: 'Joao da Silva',
    });
  });

  it('parses simple names', () => {
    expect(parseNameParts('Maria Sousa')).toEqual({
      firstName: 'Maria',
      lastName: 'Sousa',
      fullName: 'Maria Sousa',
    });
  });
});
