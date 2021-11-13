import {
  denormalizePostMessageData,
  createFunctionFromString
} from '../utils';
import { FuncSyntaxError } from '../errors';
import * as utils from '../utils';

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
    jest.spyOn(utils, 'createGeneratorFunctionFromStr').mockReturnValue(() => {});
  });

  it('should raise syntax error when function code is empty', () => {
    expect(() => createFunctionFromString('')).toThrow(FuncSyntaxError);
  });

  it('should create anonymous function from noname traditional empty function', () => {
    const createdFunc = createFunctionFromString('function () {}');

    expect(createdFunc.toString())
      .toBe('function anonymous(\n'
        + ') {\n'
        + '\n'
        + '}');
  });

  it('should create anonymous function from arrow empty function', () => {
    const createdFunc = createFunctionFromString('() => {}');

    expect(createdFunc.toString()).toBe('function anonymous(\n'
      + ') {\n'
      + '\n'
      + '}');
  });

  it('should create anonymous function from arrow function in one line', () => {
    const createdFunc = createFunctionFromString('(v) => fibonacci(v)');

    expect(createdFunc.toString()).toBe('function anonymous(v\n'
      + ') {\n'
      + ' fibonacci(v)\n'
      + '}');
  });
});
