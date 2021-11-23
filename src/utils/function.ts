import {
  FuncId,
  TaskFunction,
  TaskFunctionsCache
} from '../types';
import {
  getStrHash,
  findNextChar,
  removeChars
} from './string';

export const isFunction = (obj: any): boolean => typeof obj === 'function';

export const isGeneratorFunc = (func: TaskFunction): boolean =>
  func.constructor.name === 'GeneratorFunction';

export const createGeneratorFuncFromStr = (args: string, funcCode: string): GeneratorFunction => {
  const cls = Object.getPrototypeOf(function* () {}).constructor;
  return cls(args, funcCode);
};

export class FunctionCodeParser {
  FUNCTION_KEYWORD = 'function';
  ARROW_FUNCTION_KEYWORD = '=>';

  private readonly code: string;
  private readonly isTraditional: boolean;

  constructor(code: string) {
    this.code = code.trim();
    // check that a function is a traditional function with function keyword
    this.isTraditional = !this.code.indexOf(this.FUNCTION_KEYWORD);
  }

  get args(): string {
    let funcArgs;

    if (this.isTraditional) {
      funcArgs = this.code.substring(
        this.FUNCTION_KEYWORD.length,
        this.getTraditionalFunctionStartBodyIndex()
      );
    } else {
      funcArgs = this.code.substring(0, this.getArrowFunctionStartIndex());
    }
    return removeChars(funcArgs, ['(', ')', ' ', '*']);
  }

  get body(): string {
    let funcBodyStart;
    let funcBodyEnd;
    let isInlineArrowFunc = false;

    if (this.isTraditional) {
      funcBodyStart = this.getTraditionalFunctionStartBodyIndex() + 1;
      funcBodyEnd = this.code.lastIndexOf('}');

    } else {
      // arrow function
      funcBodyStart = this.getArrowFunctionStartIndex() + this.ARROW_FUNCTION_KEYWORD.length;

      const isInlineArrowFuncWithObjReturning = findNextChar(this.code, [' '], funcBodyStart);
      // try to find "(" as the first char after "=>" to know that a function with object returning
      if (isInlineArrowFuncWithObjReturning.char === '(') {
        isInlineArrowFunc = true;
        funcBodyStart = isInlineArrowFuncWithObjReturning.index + 1;
        funcBodyEnd = this.code.lastIndexOf(')');

      } else {
        let nextChar = findNextChar(this.code, [' '], funcBodyStart);
        if (nextChar.char === '{') {
          funcBodyStart = nextChar.index + 1;
          funcBodyEnd = this.code.lastIndexOf('}');
        } else {
          isInlineArrowFunc = true;
          funcBodyEnd = this.code.length;
        }
      }
    }
    let body = this.code.substring(funcBodyStart, funcBodyEnd).trim();

    if (isInlineArrowFunc && body) {
      return ` return ${body}`;
    }
    return body;
  }

  get isGenerator(): boolean {
    // generator function be applied only for traditional function
    // after function keyword the * char should be applied if it's a generator function
    return this.isTraditional
      && findNextChar(
        this.code, [' '], this.FUNCTION_KEYWORD.length - 1
      ).char === '*';
  }

  private getTraditionalFunctionStartBodyIndex(): number {
    return this.code.indexOf('{');
  }

  private getArrowFunctionStartIndex(): number {
    return this.code.indexOf(this.ARROW_FUNCTION_KEYWORD);
  }
}

export const generateTaskFuncId = (funcCode: string): FuncId =>
  getStrHash(funcCode).toString();

export type CreateFuncFromStrOptions = {
  cache?: TaskFunctionsCache
}

export const createFuncFromStr = (
  funcCode: string,
  { cache }: CreateFuncFromStrOptions = { cache: null }
): TaskFunction => {

  let taskFuncId = generateTaskFuncId(funcCode);
  if (cache && cache[taskFuncId]) {
    return cache[taskFuncId];
  }
  const funcCodeParser = new FunctionCodeParser(funcCode);

  const func: TaskFunction = funcCodeParser.isGenerator
    ? createGeneratorFuncFromStr(funcCodeParser.args, funcCodeParser.body)
    : new Function(funcCodeParser.args, funcCodeParser.body);

  if (cache) {
    cache[taskFuncId] = func;
  }
  return func;
};
