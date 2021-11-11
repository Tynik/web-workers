import { denormalizePostMessageData } from '../utils'

test('should return empty array', () => {
  expect(denormalizePostMessageData([])).toStrictEqual([]);
});

test('should normalize number arg', () => {
  const args = [1];

  expect(denormalizePostMessageData(args)).toStrictEqual([[null, 1]]);
});

test('should normalize string arg', () => {
  const args = ['a'];

  expect(denormalizePostMessageData(args)).toStrictEqual([[null, 'a']]);
});

test('should normalize simple object', () => {
  const args = [{ a: 1 }];

  expect(denormalizePostMessageData(args)).toStrictEqual([[null, { a: [null, 1] }]]);
});

test('should normalize nested object', () => {
  const args = [{ a: { b: 2 } }];

  expect(denormalizePostMessageData(args)).toStrictEqual([[null, { a: [null, { b: [null, 2] }] }]]);
});

test('should normalize nested object with function', () => {
  const func = () => {};
  const args = [{ a: { b: func } }];

  expect(denormalizePostMessageData(args)).toStrictEqual([[null, { a: [null, { b: ['f', func.toString()] }] }]]);
});
