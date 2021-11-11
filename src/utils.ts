import { FuncId, TaskFunction } from './types';

export const CreateGeneratorFunctionFromStr = (args: string, func: string): GeneratorFunction => {
  const cls = Object.getPrototypeOf(function* () {}).constructor;
  return new (
    cls(args, func)
  )();
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
