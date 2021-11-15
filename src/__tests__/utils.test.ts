import {
  denormalizePostMessageData,
  createFuncFromStr,
  findNextChar,
  getStrHash,
  genId
} from '../utils';
import { FuncSyntaxError } from '../errors';
import * as functionUtils from '../utils/function';

describe('Denormalize data for post message function', () => {
  test('should return empty array', () => {
    expect(denormalizePostMessageData([])).toStrictEqual([]);
  });

  test('should denormalize number arg', () => {
    const args = [1];

    expect(denormalizePostMessageData(args)).toStrictEqual([[null, 1]]);
  });

  test('should denormalize string arg', () => {
    const args = ['a'];

    expect(denormalizePostMessageData(args)).toStrictEqual([[null, 'a']]);
  });

  test('should denormalize simple object', () => {
    const args = [{ a: 1 }];

    expect(denormalizePostMessageData(args))
      .toStrictEqual([[null, { a: [null, 1] }]]);
  });

  test('should denormalize nested object', () => {
    const args = [{ a: { b: 2 } }];

    expect(denormalizePostMessageData(args))
      .toStrictEqual([[null, { a: [null, { b: [null, 2] }] }]]);
  });

  test('should denormalize nested object with function', () => {
    const func = () => {};
    const args = [{ a: { b: func } }];

    expect(denormalizePostMessageData(args))
      .toStrictEqual([[null, { a: [null, { b: ['f', func.toString()] }] }]]);
  });
});

describe('Create a function from string', () => {
  beforeAll(() => {
    // @ts-expect-error
    jest.spyOn(functionUtils, 'createGeneratorFuncFromStr').mockReturnValue(() => {});
  });

  it('should raise syntax error when function code is empty', () => {
    expect(() => createFuncFromStr('')).toThrow(FuncSyntaxError);
  });

  it('should create anonymous function from noname traditional empty function', () => {
    const createdFunc = createFuncFromStr('function () {}');

    expect(createdFunc.toString())
      .toBe('function anonymous(\n'
        + ') {\n'
        + '\n'
        + '}');
  });

  it('should create anonymous function from noname traditional filled function', () => {
    const createdFunc = createFuncFromStr('function () {\n'
      + 'return () => {\n'
      + ' return 1;\n'
      + '}\n'
      + '}');

    expect(createdFunc.toString())
      .toBe('function anonymous(\n'
        + ') {\n'
        + 'return () => {\n'
        + ' return 1;\n'
        + '}\n'
        + '}');
  });

  it('should create anonymous function from arrow empty function', () => {
    const createdFunc = createFuncFromStr('() => {}');

    expect(createdFunc.toString()).toBe('function anonymous(\n'
      + ') {\n'
      + '\n'
      + '}');
  });

  it('should create anonymous function from arrow function', () => {
    const createdFunc = createFuncFromStr('() => {\n'
      + ' return { a: 1 };'
      + '\n}');

    expect(createdFunc.toString()).toBe('function anonymous(\n'
      + ') {\n'
      + 'return { a: 1 };\n'
      + '}');
  });

  it('should create anonymous function from inline arrow function', () => {
    const createdFunc = createFuncFromStr('(v) => fibonacci(v)');

    expect(createdFunc.toString()).toBe('function anonymous(v\n'
      + ') {\n'
      + ' return fibonacci(v)\n'
      + '}');
  });

  it('should create anonymous function from inline arrow function 2', () => {
    const createdFunc = createFuncFromStr('(v) => calc({ a: 1 })');

    expect(createdFunc.toString()).toBe('function anonymous(v\n'
      + ') {\n'
      + ' return calc({ a: 1 })\n'
      + '}');
  });

  it('should create anonymous function from inline arrow function with returning empty object', () => {
    const createdFunc = createFuncFromStr('(v) => ({})');

    expect(createdFunc.toString()).toBe('function anonymous(v\n'
      + ') {\n'
      + ' return {}\n'
      + '}');
  });

  it('should create anonymous function from inline arrow function with returning fill object', () => {
    const createdFunc = createFuncFromStr('(v) => ({ a: 1, b: 2 })');

    expect(createdFunc.toString()).toBe('function anonymous(v\n'
      + ') {\n'
      + ' return { a: 1, b: 2 }\n'
      + '}');
  });
});

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
