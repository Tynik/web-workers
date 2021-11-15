export const genId = (length: number = 9): string =>
  Math.random().toString(36).substr(2, length);

export const getStrHash = (str: string): number => {
  let hash;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return hash;
};

export const findNextChar = (str: string, skipChars: string[], from: number = 0): {
  char: string
  index: number
} => {
  for (let i = from + 1; i < str.length; i++) {
    if (skipChars.includes(str[i])) {
      continue;
    }
    return {
      char: str[i],
      index: i
    };
  }
  return {
    char: null,
    index: null
  };
};
