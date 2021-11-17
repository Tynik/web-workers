import {
  normalizePostMessageData,
  denormalizePostMessageData,
} from '../';

describe('Denormalize data for post message function', () => {
  test('should denormalize empty array', () => {
    expect(denormalizePostMessageData([])).toStrictEqual([null, []]);
  });

  test('should denormalize number arg', () => {
    const args = [1];

    expect(denormalizePostMessageData(args)).toStrictEqual([null, [[null, 1]]]);
  });

  test('should denormalize string arg', () => {
    const args = ['a'];

    expect(denormalizePostMessageData(args)).toStrictEqual([null, [[null, 'a']]]);
  });

  test('should denormalize simple object', () => {
    const args = [{ a: 1 }];

    expect(denormalizePostMessageData(args))
      .toStrictEqual([null, [[null, { a: [null, 1] }]]]);
  });

  test('should denormalize nested object', () => {
    const args = [{ a: { b: 2 } }];

    expect(denormalizePostMessageData(args))
      .toStrictEqual([null, [[null, { a: [null, { b: [null, 2] }] }]]]);
  });

  test('should denormalize nested object with a function', () => {
    const func = () => {};
    const args = [{ a: { b: func } }];

    expect(denormalizePostMessageData(args))
      .toStrictEqual([null, [[null, { a: [null, { b: ['f', func.toString()] }] }]]]);
  });
});

describe('Normalize data for post message function', () => {
  const normalizeFuncHandler = (funcCode: string) => funcCode as any;

  test('should normalize empty array', () => {
    expect(normalizePostMessageData([null, []], normalizeFuncHandler))
      .toStrictEqual([]);
  });

  test('should normalize number arg', () => {
    const args = [null, [[null, 1]]];

    expect(normalizePostMessageData(args, normalizeFuncHandler))
      .toStrictEqual([1]);
  });

  test('should normalize string arg', () => {
    const args = [null, [[null, 'a']]];

    expect(normalizePostMessageData(args, normalizeFuncHandler))
      .toStrictEqual(['a']);
  });

  test('should normalize simple object', () => {
    const args = [null, [[null, { a: [null, 1] }]]];

    expect(normalizePostMessageData(args, normalizeFuncHandler))
      .toStrictEqual([{ a: 1 }]);
  });

  test('should normalize nested object', () => {
    const args = [null, [[null, { a: [null, { b: [null, 2] }] }]]];

    expect(normalizePostMessageData(args, normalizeFuncHandler))
      .toStrictEqual([{ a: { b: 2 } }]);
  });

  test('should normalize nested object with a function', () => {
    const serializedFunc = (() => {}).toString();
    const args = [null, [[null, { a: [null, { b: ['f', serializedFunc] }] }]]];

    expect(normalizePostMessageData(args, normalizeFuncHandler))
      .toStrictEqual([{ a: { b: serializedFunc } }]);
  });
});
