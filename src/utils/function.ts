import {
  FuncId,
  TaskFunction,
  TaskFunctionsCache
} from '../types';
import { GenFuncSyntaxError, FuncSyntaxError } from '../errors';
import { strHash, findNextChar } from './string';

export const createGeneratorFuncFromStr = (args: string, func: string): GeneratorFunction => {
  const cls = Object.getPrototypeOf(function* () {}).constructor;
  return cls(args, func);
};

export const generateTaskFuncId = (funcCode: string, args: any[] = []): FuncId =>
  strHash(funcCode + JSON.stringify(args));

export const isGeneratorFunc = (func: TaskFunction): boolean =>
  func.constructor.name === 'GeneratorFunction';

export const getFuncArgsFromStr = (funcCode: string): {
  args: string
  isGenerator: boolean
} => {
  const startFuncArgsFrom = funcCode.indexOf('(') + 1;
  if (!startFuncArgsFrom) {
    throw new FuncSyntaxError();
  }
  const endFuncArgs = funcCode.indexOf(')', startFuncArgsFrom);
  if (startFuncArgsFrom === -1) {
    throw new FuncSyntaxError();
  }
  let isGenerator = false;
  // NOTE: inline arrow function cannot be as generator function
  const generatorMark = funcCode.indexOf('*');
  if (generatorMark !== -1) {
    if (generatorMark > startFuncArgsFrom) {
      throw new GenFuncSyntaxError();
    }
    isGenerator = true;
  }

  return {
    isGenerator,
    args: funcCode.substring(startFuncArgsFrom, endFuncArgs)
  };
};

export const getFuncBodyFromStr = (funcCode: string): string => {
  funcCode = funcCode.trim();

  let isArrowFunc = false;
  let isInlineArrowFunc = false;
  let isInlineArrowFuncWithObjReturning = false;

  let funcBodyStart = !funcCode.indexOf('function')
    ? 1
    : funcCode.indexOf('=>') + 2;

  if (funcBodyStart === 1) {
    // if "=>" was not found, so it's not an arrow function and will try to find "{"
    funcBodyStart = funcCode.indexOf('{') + 1;
    if (!funcBodyStart) {
      throw new FuncSyntaxError();
    }
  } else {
    isArrowFunc = true;
    // try to find "{" as the first char after "=>" to know that a function with object returning
    isInlineArrowFuncWithObjReturning = findNextChar(funcCode, [' '], funcBodyStart).char === '(';
  }
  let funcBodyEnd;
  if (isArrowFunc) {
    if (isInlineArrowFuncWithObjReturning) {
      isInlineArrowFunc = true;
      funcBodyStart = funcCode.indexOf('(', funcBodyStart) + 1;
      funcBodyEnd = funcCode.lastIndexOf(')');

    } else {
      let nextChar = findNextChar(funcCode, [' '], funcBodyStart);
      if (nextChar.char === '{') {
        funcBodyStart = nextChar.index + 1;
        funcBodyEnd = funcCode.lastIndexOf('}');
      } else {
        isInlineArrowFunc = true;
        funcBodyEnd = funcCode.length;
      }
    }
  } else {
    funcBodyEnd = funcCode.lastIndexOf('}');
  }

  let body = funcCode.substring(funcBodyStart, funcBodyEnd).trim();

  if (isInlineArrowFunc && body) {
    body = ` return ${body}`;
  }
  return body;
};

export const createFuncFromStr = (
  funcCode: string,
  args: any[] = [],
  {
    cacheTime,
    cache
  }: {
    cacheTime?: number
    cache?: TaskFunctionsCache
  } = {
    cacheTime: null,
    cache: {}
  }
): TaskFunction => {

  const updateCacheFuncExpiredTime = (funcId: FuncId, cacheTime: number) => {
    cache[funcId].expired = performance.now() + cacheTime;
  };

  let taskFuncId = generateTaskFuncId(funcCode, args);
  if (cache[taskFuncId]) {
    if (cacheTime) {
      updateCacheFuncExpiredTime(taskFuncId, cacheTime);
    }
    return cache[taskFuncId].func;
  }
  const {
    args: funcArgs,
    isGenerator: isGeneratorFunc
  } = getFuncArgsFromStr(funcCode);

  const funcBody = getFuncBodyFromStr(funcCode);

  const func: TaskFunction = isGeneratorFunc
    ? createGeneratorFuncFromStr(funcArgs, funcBody)
    : new Function(funcArgs, funcBody);

  if (cacheTime) {
    cache[taskFuncId] = { func };
    updateCacheFuncExpiredTime(taskFuncId, cacheTime);
  }
  return func;
};
