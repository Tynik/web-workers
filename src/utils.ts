import {
  FuncId,
  TaskFunction,
  TaskFunctionsCache
} from './types';
import { GenFuncSyntaxError, FuncSyntaxError } from './errors';

export const createGeneratorFunctionFromStr = (args: string, func: string): GeneratorFunction => {
  const cls = Object.getPrototypeOf(function* () {}).constructor;
  return cls(args, func);
};

export const strHash = (str: string): string => {
  let h;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return str;
};

export const generateTaskFuncId = (funcCode: string, args: any[] = []): FuncId =>
  strHash(funcCode + JSON.stringify(args));

export const isGenerator = (func: TaskFunction): boolean =>
  func.constructor.name === 'GeneratorFunction';

export const ID = (): string =>
  '_' + Math.random().toString(36).substr(2, 9);

type DenormalizedFunctionType = string;

const DENORMALIZED_FUNCTION_TYPE: DenormalizedFunctionType = 'f';

export type PostMessageDataItem =
  number
  | string
  | boolean
  | Function
  | Blob
  | FileList
  | []
  | PostMessageDataObjectItem;

interface PostMessageDataObjectItem {
  [key: string]: PostMessageDataItem;
}

type DenormalizedPostMessageDataItemValue =
  number
  | string
  | boolean
  | Blob
  | FileList
  | DenormalizedPostMessageDataItem[]
  | DenormalizedPostMessageDataObjectItem;

export type DenormalizedPostMessageDataItem = [
    DenormalizedFunctionType | null,
  DenormalizedPostMessageDataItemValue
];

interface DenormalizedPostMessageDataObjectItem {
  [key: string]: DenormalizedPostMessageDataItem;
}

export const denormalizePostMessageData = (
  data: PostMessageDataItem[] | PostMessageDataObjectItem
): DenormalizedPostMessageDataItem[] | DenormalizedPostMessageDataObjectItem => {
  if (Array.isArray(data)) {
    return data.reduce((result, item) => {
      if (typeof item === 'function') {
        result.push([DENORMALIZED_FUNCTION_TYPE, String(item)]);
        return result;
      }
      if (typeof item === 'object' && !(
        item instanceof Blob
      ) && !(
        item instanceof FileList
      )) {
        result.push([null, denormalizePostMessageData(item)]);
        return result;
      }
      result.push([null, item]);
      return result;
    }, [] as DenormalizedPostMessageDataItem[]);
  }

  return Object.keys(data).reduce((result, key) => {
    if (typeof data[key] === 'function') {
      result[key] = [DENORMALIZED_FUNCTION_TYPE, String(data[key])];
      return result;
    }
    if (typeof data[key] === 'object' && !(
      data[key] instanceof Blob
    ) && !(
      data[key] instanceof FileList
    )) {
      result[key] = [null, denormalizePostMessageData(data[key] as PostMessageDataObjectItem)];
      return result;
    }
    result[key] = [null, data[key] as DenormalizedPostMessageDataItemValue];
    return result;
  }, {} as DenormalizedPostMessageDataObjectItem);
};

export const normalizePostMessageData = (
  data: DenormalizedPostMessageDataItem[] | DenormalizedPostMessageDataObjectItem,
  normalizeFuncHandler: (item: string) => any
): PostMessageDataItem[] | PostMessageDataObjectItem => {
  if (Array.isArray(data)) {
    return data.map(([type, item]) => {
      if (type === DENORMALIZED_FUNCTION_TYPE) {
        return normalizeFuncHandler(item as string);
      }
      if (typeof item === 'object' && !(
        item instanceof Blob
      ) && !(
        item instanceof FileList
      )) {
        return normalizePostMessageData(item, normalizeFuncHandler);
      }
      return item;
    });
  }
  return Object.keys(data).reduce((result, key) => {
    const [type, obj]: DenormalizedPostMessageDataItem = data[key];

    if (type === DENORMALIZED_FUNCTION_TYPE) {
      result[key] = normalizeFuncHandler(obj as string);
      return result;
    }
    if (typeof obj === 'object' && !(
      obj instanceof Blob
    ) && !(
      obj instanceof FileList
    )) {
      return normalizePostMessageData(obj, normalizeFuncHandler);
    }
    result[key] = obj;
    return result;
  }, {} as PostMessageDataObjectItem);
};

export const createFunctionFromStr = (
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
  const startFuncArgsFrom = funcCode.indexOf('(') + 1;
  if (!startFuncArgsFrom) {
    throw new FuncSyntaxError();
  }
  const endFuncArgs = funcCode.indexOf(')', startFuncArgsFrom);
  if (startFuncArgsFrom === -1) {
    throw new FuncSyntaxError();
  }
  const funcArgs = funcCode.substring(startFuncArgsFrom, endFuncArgs);

  let funcBodyStart = funcCode.indexOf('{', endFuncArgs) + 1;
  let funcBodyEnd;
  let isInlineArrowFunc = false;

  if (!funcBodyStart) {
    // if "{" was not found then will try to find => (function in one line)
    funcBodyStart = funcCode.indexOf('=>', endFuncArgs) + 2;
    if (funcBodyStart === 1) {
      throw new FuncSyntaxError();
    }
    isInlineArrowFunc = true;
    funcBodyEnd = funcCode.length;
  } else {
    funcBodyEnd = funcCode.length - 1;
  }
  let funcBody = funcCode.substring(funcBodyStart, funcBodyEnd);

  let isGeneratorFunc = false;
  if (isInlineArrowFunc) {
    funcBody = ` return${funcBody}`;

  } else {
    // inline arrow function cannot be as generator function
    const generatorMark = funcCode.indexOf('*');
    if (generatorMark !== -1) {
      if (generatorMark > startFuncArgsFrom) {
        throw new GenFuncSyntaxError();
      }
      isGeneratorFunc = true;
    }
  }

  const func: TaskFunction = isGeneratorFunc
    ? createGeneratorFunctionFromStr(funcArgs, funcBody)
    : new Function(funcArgs, funcBody);

  if (cacheTime) {
    cache[taskFuncId] = { func };
    updateCacheFuncExpiredTime(taskFuncId, cacheTime);
  }
  return func;
};
