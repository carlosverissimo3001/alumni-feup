import { toBoolean } from './toBoolean';

describe('toBoolean', () => {
  it('converts boolean strings', () => {
    expect(toBoolean('true')).toBe(true);
    expect(toBoolean('FALSE')).toBe(false);
  });

  it('leaves non boolean strings as-is', () => {
    expect(toBoolean('yes')).toBe('yes');
  });

  it('returns boolean values unchanged', () => {
    expect(toBoolean(true)).toBe(true);
  });
});
