import {
  FuncId,
  TaskFunction,
  TaskFunctionsCache
} from '../types';
import { GenFuncSyntaxError, FuncSyntaxError } from '../errors';
import { getStrHash, findNextChar } from './string';

export const isFunction = (primitive: any): boolean => typeof primitive === 'function';

export const isGeneratorFunc = (func: TaskFunction): boolean =>
  func.constructor.name === 'GeneratorFunction';

export const createGeneratorFuncFromStr = (args: string, func: string): GeneratorFunction => {
  const cls = Object.getPrototypeOf(function* () {}).constructor;
  return cls(args, func);
};

export const generateTaskFuncId = (funcCode: string, args: any[] = []): FuncId =>
  getStrHash(funcCode + JSON.stringify(args)).toString();

export const getFuncArgsFromStr = (funcCode: string): {
  args: string
  isGenerator: boolean
} => {
  const startFuncArgsFrom = funcCode.indexOf('(') + 1;
  if (!startFuncArgsFrom) {
    throw new FuncSyntaxError();
  }
  const endFuncArgs = funcCode.indexOf(')', startFuncArgsFrom);
  if (endFuncArgs === -1) {
    throw new FuncSyntaxError();
  }
  let isGenerator = false;
  const generatorMark = funcCode.indexOf('*');
  if (generatorMark !== -1) {
    isGenerator = generatorMark < startFuncArgsFrom;
  }

  return {
    isGenerator,
    args: funcCode.substring(startFuncArgsFrom, endFuncArgs)
  };
};

export const getFuncBodyFromStr = (funcCode: string): string => {
  funcCode = funcCode.trim();

  let funcBodyStart;
  let funcBodyEnd;
  let isInlineArrowFunc = false;

  const isTraditionalFunc = funcCode.indexOf('function');
  if (!isTraditionalFunc) {
    funcBodyStart = funcCode.indexOf('{', isTraditionalFunc) + 1;
    if (!funcBodyStart) {
      throw new FuncSyntaxError();
    }
    funcBodyEnd = funcCode.lastIndexOf('}');

  } else {
    // arrow function
    funcBodyStart = funcCode.indexOf('=>') + 2;

    const isInlineArrowFuncWithObjReturning = findNextChar(funcCode, [' '], funcBodyStart);
    // try to find "(" as the first char after "=>" to know that a function with object returning
    if (isInlineArrowFuncWithObjReturning.char === '(') {
      isInlineArrowFunc = true;
      funcBodyStart = isInlineArrowFuncWithObjReturning.index + 1;
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
  }

  let body = funcCode.substring(funcBodyStart, funcBodyEnd).trim();

  if (isInlineArrowFunc && body) {
    body = ` return ${body}`;
  }
  return body;
};

export type CreateFuncFromStrOptions = {
  cacheTime?: number
  cache?: TaskFunctionsCache
}

export const createFuncFromStr = (
  funcCode: string,
  args: any[] = [],
  { cacheTime, cache }: CreateFuncFromStrOptions = { cacheTime: null, cache: {} }
): TaskFunction => {

  const updateFuncCacheExpiredTime = (funcId: FuncId, cacheTime: number) => {
    cache[funcId].expired = performance.now() + cacheTime;
  };

  let taskFuncId = generateTaskFuncId(funcCode, args);
  if (cache[taskFuncId]) {
    if (cacheTime) {
      updateFuncCacheExpiredTime(taskFuncId, cacheTime);
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
    updateFuncCacheExpiredTime(taskFuncId, cacheTime);
  }
  return func;
};
