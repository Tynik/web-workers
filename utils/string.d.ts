export declare const genId: (length?: number) => string;
export declare const getStrHash: (str: string) => number;
export declare const findNextChar: (str: string, skipChars: string[], from?: number) => {
    char: string;
    index: number;
};
