import { TaskFunctionsCache } from '../../types';
import {
  FunctionCodeParser,
  createFuncFromStr
} from '../';
import * as functionUtils from '../function';

describe('Get function args from string', () => {
  it('should return function args', () => {
    expect((new FunctionCodeParser('function (a, b) {}')).args).toBe('a,b');
  });

  it('should not detect generator function', () => {
    expect((new FunctionCodeParser('function (a, b) {}')).isGenerator).toBeFalsy();
  });

  it('should detect generator function', () => {
    expect((new FunctionCodeParser('function* (a, b) {}')).isGenerator).toBeTruthy();
  });

  it('should return arguments from generator function', () => {
    expect((new FunctionCodeParser('function* (a, b) {}')).args).toBe('a,b');
  });

  it('should return single argument from arrow function', () => {
    expect((new FunctionCodeParser('a => 1')).args).toBe('a')
  });

  it('should return several arguments from arrow function', () => {
    expect((new FunctionCodeParser('(a, b) => 1')).args).toBe('a,b')
  });

  it('should return spread argument from a function', () => {
    expect((new FunctionCodeParser('function (...a) {}')).args).toBe('...a')
  });

  it('should return argument and spread argument from a function', () => {
    expect((new FunctionCodeParser('function (a, ...b) {}')).args).toBe('a,...b')
  });

  it('should return spread argument from arrow function', () => {
    expect((new FunctionCodeParser('(...a) => 1')).args).toBe('...a')
  });
});

describe('Create a function from a string', () => {
  let mockedFuncId = 'some-func-id';

  beforeAll(() => {
    jest.spyOn(functionUtils, 'generateTaskFuncId').mockReturnValue(mockedFuncId);
    // @ts-expect-error
    jest.spyOn(functionUtils, 'createGeneratorFuncFromStr').mockReturnValue(() => {});
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

  it('should cache newly created function', () => {
    const functionsCache: TaskFunctionsCache = {};

    const createdFunc = createFuncFromStr(
      '(v) => {}',
      { cache: functionsCache }
    );
    expect(functionsCache[mockedFuncId]).toBe(createdFunc);
  });

  it('should return cached function', () => {
    const cachedFunc = () => 1;

    const functionsCache: TaskFunctionsCache = {
      [mockedFuncId]: cachedFunc
    };
    const createdFunc = createFuncFromStr(
      '(v) => {}', { cache: functionsCache }
    );
    expect(createdFunc).toBe(cachedFunc);
  });
});
