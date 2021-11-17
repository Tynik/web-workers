import {
  findNextChar,
  getStrHash,
  genId
} from '../';

describe('Find next char in string', () => {
  it('should return null when string is empty', () => {
    expect(findNextChar('', []).char).toBe(null);
  });

  it('should return null when there is no next char', () => {
    expect(findNextChar('a', []).char).toBe(null);
  });

  it('should return next char if present', () => {
    expect(findNextChar('ab', []).char).toBe('b');
  });

  it('should return next char if present with skipping some chars', () => {
    expect(findNextChar('a  bc', [' ']).char).toBe('b');
  });
});

describe('Generate hash of a string', () => {
  it('should return undefined when string is empty', () => {
    expect(getStrHash('')).toBeUndefined();
  });

  it('should return hash of "abc"', () => {
    expect(getStrHash('abc')).toBe(96354);
  });

  it('should return hash of "123"', () => {
    expect(getStrHash('123')).toBe(48690);
  });
});

describe('Generating ID number', () => {
  it('should have 9 chars by default', () => {
    expect(genId()).toHaveLength(9);
  });

  it('should generate 3 chars ID', () => {
    expect(genId(3)).toHaveLength(3);
  });

  it('should generate unique values called 3 times', () => {
    const ids = [genId(), genId(), genId()];

    expect([...new Set(ids)]).toHaveLength(3);
  });
});
