import {
  createFuncFromStr,
} from '../';
import { FuncSyntaxError } from '../../errors';
import * as functionUtils from '../function';

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
