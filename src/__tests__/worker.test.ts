import { TaskWorker } from '../types';
import Worker from '../worker';
import * as utils from '../utils';

const SIMPLE_FUNC_CODE_NO_RETURN = '(){}';
const SIMPLE_FUNC_CODE_WITH_RETURN = '(){return "hello";}';
const EMPTY_GENERATOR_FUNC_CODE = '*(){}';
const SIMPLE_ONE_ITER_GENERATOR_FUNC_CODE = '*(){yield 3;}';

// jest.mock('../utils', () => {
//   const utils = jest.requireActual('../utils');
//
//   return {
//     ...utils,
//     CreateGeneratorFunctionFromStr: jest.fn()
//   };
// });

describe('Functions', () => {
  let worker: TaskWorker & {
    postMessage: jest.Mock<any>
  };

  beforeEach(() => {
    worker = new Worker();
    worker.postMessage = jest.fn();
  });

  test('should raise started and completed event when a simple function passed', () => {
    worker.onmessage({ data: { taskRunId: '123', func: SIMPLE_FUNC_CODE_NO_RETURN, customEvents: {} } } as any);

    expect(worker.postMessage).toBeCalledTimes(2);
    expect(worker.postMessage.mock.calls[0][0].eventName).toBe('started');
    expect(worker.postMessage.mock.calls[1][0].eventName).toBe('completed');
  });

  test('should measure the execution time of a function', () => {
    worker.onmessage({ data: { taskRunId: '123', func: SIMPLE_FUNC_CODE_NO_RETURN, customEvents: {} } } as any);

    expect(worker.postMessage).toBeCalledTimes(2);
    expect(worker.postMessage.mock.calls[0][0].eventName).toBe('started');
    expect(worker.postMessage.mock.calls[0][0].meta.tookTime).toBeUndefined();
    expect(worker.postMessage.mock.calls[1][0].eventName).toBe('completed');
    expect(worker.postMessage.mock.calls[1][0].meta.tookTime).toBeGreaterThan(0);
  });

  test('should return result after calling a simple function', () => {
    worker.onmessage({ data: { taskRunId: '123', func: SIMPLE_FUNC_CODE_WITH_RETURN, customEvents: {} } } as any);

    expect(worker.postMessage).toBeCalledTimes(2);
    expect(worker.postMessage.mock.calls[0][0].eventName).toBe('started');
    expect(worker.postMessage.mock.calls[0][0].result).toBeNull();
    expect(worker.postMessage.mock.calls[1][0].eventName).toBe('completed');
    expect(worker.postMessage.mock.calls[1][0].result).toBe('hello');
  });
});

describe('Generators', () => {
  let worker: TaskWorker & {
    postMessage: jest.Mock<any>
  };

  beforeAll(() => {
    // @ts-ignore
    jest.spyOn(utils, 'CreateGeneratorFunctionFromStr').mockReturnValue(() => {});
  });

  beforeEach(() => {
    worker = new Worker();
    worker.postMessage = jest.fn();
  });

  test('should accept empty generator as task function', () => {
    worker.onmessage({ data: { taskRunId: '123', func: EMPTY_GENERATOR_FUNC_CODE, customEvents: {} } } as any);

    expect(worker.postMessage).toBeCalledTimes(2);
  });
});
