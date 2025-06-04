import { formatYearsToHuman } from './format';

describe('formatYearsToHuman', () => {
  it('returns "0 years" for falsy values', () => {
    expect(formatYearsToHuman(0)).toBe('0 years');
  });

  it('formats whole years correctly', () => {
    expect(formatYearsToHuman(1)).toBe('1 year');
    expect(formatYearsToHuman(2)).toBe('2 years');
  });

  it('formats years with months', () => {
    expect(formatYearsToHuman(2.5)).toBe('2 years and 6 months');
  });
});
