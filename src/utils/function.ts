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
