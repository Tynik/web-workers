import { TaskFunction } from '../types';
import { isFunction } from './function';

export enum DenormalizedObjectType {
  FUNCTION = 'f'
}

export const CLONEABLE_OBJECTS = [
  Date,
  RegExp,
  Blob,
  File,
  FileList
  // ArrayBuffer,
  // Int8Array,
  // Uint8Array,
  // Uint8ClampedArray,
  // Int16Array,
  // Uint16Array,
  // Int32Array,
  // Uint32Array,
  // Float32Array,
  // Float64Array,
  // DataView
  // ImageBitmap,
  // ImageData,
  // Map,
  // Set
];

export const ifCloneableObject = (obj: any) =>
  obj === null
  || CLONEABLE_OBJECTS.some(objClass =>
    typeof obj === 'number'
    || typeof obj === 'string'
    || typeof obj === 'boolean'
    || obj instanceof objClass
  );

export const denormalizePostMessageData = (data: any): any => {
  if (isFunction(data)) {
    return [DenormalizedObjectType.FUNCTION, String(data)];
  }

  if (ifCloneableObject(data)) {
    return [null, data];
  }

  if (Array.isArray(data)) {
    return [
      null,
      data.map(item => denormalizePostMessageData(item))
    ];
  }

  return [
    null,
    Object.keys(data).reduce(
      (result, key) => {
        result[key] = denormalizePostMessageData(data[key]);
        return result;
      }, {})
  ];
};

export const normalizePostMessageData = (
  args: any[],
  normalizeFuncHandler: (obj: string) => TaskFunction
): any => {
  if (args.length < 2) {
    return [];
  }
  const [primitiveType, obj] = args;

  if (primitiveType === DenormalizedObjectType.FUNCTION) {
    return normalizeFuncHandler(obj);
  }

  if (ifCloneableObject(obj)) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => normalizePostMessageData(item, normalizeFuncHandler));
  }

  return Object.keys(obj).reduce((result, key) => {
    result[key] = normalizePostMessageData(obj[key], normalizeFuncHandler);
    return result;
  }, {});
};
