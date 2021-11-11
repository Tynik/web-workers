import Worker from '../worker';
import { CreateGeneratorFunctionFromStr } from '../utils';

const SIMPLE_FUNC_CODE_NO_RETURN = '(){}';
const SIMPLE_FUNC_CODE_WITH_RETURN = '(){return "hello";}';
const EMPTY_GENERATOR_FUNC_CODE = '*(){}';
const SIMPLE_ONE_ITER_GENERATOR_FUNC_CODE = '*(){yield 3;}';

jest.mock('../utils');

describe('Functions', () => {
  let worker;

  beforeEach(() => {
    worker = new Worker();
    worker.postMessage = jest.fn();
  });

  test('should pass taskRunId as required param', () => {
    expect(() => {
      worker.onmessage({ data: { taskRunId: '' } });
    }).toThrow('taskRunId is required param');
  });

  test('should raise started and completed event when a simple function passed', () => {
    worker.onmessage({ data: { taskRunId: '123', func: SIMPLE_FUNC_CODE_NO_RETURN } });

    expect(worker.postMessage).toBeCalledTimes(2);
    expect(worker.postMessage.mock.calls[0][0].eventName).toBe('started');
    expect(worker.postMessage.mock.calls[1][0].eventName).toBe('completed');
  });

  test('should measure the execution time of a function', () => {
    worker.onmessage({ data: { taskRunId: '123', func: SIMPLE_FUNC_CODE_NO_RETURN } });

    expect(worker.postMessage).toBeCalledTimes(2);
    expect(worker.postMessage.mock.calls[0][0].eventName).toBe('started');
    expect(worker.postMessage.mock.calls[0][0].meta.tookTime).toBeUndefined();
    expect(worker.postMessage.mock.calls[1][0].eventName).toBe('completed');
    expect(worker.postMessage.mock.calls[1][0].meta.tookTime).toBeGreaterThan(0);
  });

  test('should return result after calling a simple function', () => {
    worker.onmessage({ data: { taskRunId: '123', func: SIMPLE_FUNC_CODE_WITH_RETURN } });

    expect(worker.postMessage).toBeCalledTimes(2);
    expect(worker.postMessage.mock.calls[0][0].eventName).toBe('started');
    expect(worker.postMessage.mock.calls[0][0].result).toBeNull();
    expect(worker.postMessage.mock.calls[1][0].eventName).toBe('completed');
    expect(worker.postMessage.mock.calls[1][0].result).toBe('hello');
  });
});

describe('Generators', () => {
  let worker;

  beforeAll(() => {
    (
      CreateGeneratorFunctionFromStr as any as jest.MockInstance<any, any>
    ).mockReturnValue(() => {});
  });

  beforeEach(() => {
    worker = new Worker();
    worker.postMessage = jest.fn();
  });

  test('1', () => {
    worker.onmessage({ data: { taskRunId: '123', func: EMPTY_GENERATOR_FUNC_CODE } });
  });
});
