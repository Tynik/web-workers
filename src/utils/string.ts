export const Id = (): string =>
  '_' + Math.random().toString(36).substr(2, 9);

export const strHash = (str: string): string => {
  let h;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return str;
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
