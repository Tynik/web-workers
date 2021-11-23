import { TaskEvent, TaskWorker } from '../types';
import Worker from '../worker';
import * as functionUtils from '../utils/function';

const SIMPLE_FUNC_CODE_NO_RETURN = '(){}';
const SIMPLE_FUNC_CODE_WITH_RETURN = '(){return "hello";}';
const EMPTY_GENERATOR_FUNC_CODE = 'function*(){}';
const SIMPLE_ONE_ITER_GENERATOR_FUNC_CODE = 'function*(){yield 3;}';

describe('Functions', () => {
  let worker: TaskWorker & {
    postMessage: jest.Mock<any>
  };

  beforeEach(() => {
    worker = Worker();
    worker.postMessage = jest.fn();
  });

  test('should raise started and completed event when a simple function passed', () => {
    worker.onmessage({
      data: { taskRunId: '123', func: SIMPLE_FUNC_CODE_NO_RETURN, customEvents: {} }
    } as any);

    expect(worker.postMessage).toBeCalledTimes(2);
    expect(worker.postMessage.mock.calls[0][0].eventName).toBe(TaskEvent.STARTED);
    expect(worker.postMessage.mock.calls[1][0].eventName).toBe(TaskEvent.COMPLETED);
  });

  test('should measure the execution time of a simple function', () => {
    worker.onmessage({
      data: { taskRunId: '123', func: SIMPLE_FUNC_CODE_NO_RETURN, customEvents: {} }
    } as any);

    expect(worker.postMessage).toBeCalledTimes(2);
    expect(worker.postMessage.mock.calls[0][0].tookTime).toBeUndefined();
    expect(worker.postMessage.mock.calls[1][0].tookTime).toBeGreaterThan(0);
  });

  test('should return result after calling a simple function', () => {
    worker.onmessage({
      data: { taskRunId: '123', func: SIMPLE_FUNC_CODE_WITH_RETURN, customEvents: {} }
    } as any);

    expect(worker.postMessage).toBeCalledTimes(2);
    expect(worker.postMessage.mock.calls[0][0].result).toBeNull();
    expect(worker.postMessage.mock.calls[1][0].result).toBe('hello');
  });
});

describe('Generators', () => {
  let worker: TaskWorker & {
    postMessage: jest.Mock<any>
  };
  let generatorNextFunc: jest.Mock<any>;

  beforeAll(() => {
    generatorNextFunc = jest.fn();
    // @ts-expect-error
    jest.spyOn(functionUtils, 'createGeneratorFuncFromStr').mockReturnValue(() => (
      {
        next: generatorNextFunc
      }
    ));
    jest.spyOn(functionUtils, 'isGeneratorFunc').mockReturnValue(true);
  });

  beforeEach(() => {
    worker = Worker();
    worker.postMessage = jest.fn();
  });

  afterEach(() => {
    generatorNextFunc.mockClear();
  });

  test('should raise started and completed event when a generator function passed', () => {
    generatorNextFunc.mockReturnValue({
      done: true
    });

    worker.onmessage({
      data: { taskRunId: '123', func: EMPTY_GENERATOR_FUNC_CODE, customEvents: {} }
    } as any);

    expect(worker.postMessage).toBeCalledTimes(2);
    expect(worker.postMessage.mock.calls[0][0].eventName).toBe(TaskEvent.STARTED);
    expect(worker.postMessage.mock.calls[1][0].eventName).toBe(TaskEvent.COMPLETED);

    expect(generatorNextFunc).toBeCalledTimes(1);
    expect(generatorNextFunc).toBeCalledWith();
  });
});
