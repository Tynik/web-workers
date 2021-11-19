import {
  isGeneratorFunc,
  normalizePostMessageData,
  createFuncFromStr
} from './utils';
import {
  TaskRunId,
  TaskFunctionsCache,
  TaskFunctionResult,
  TaskWorker,
  TaskEvent
} from './types';
import { NextIterationError } from './errors';
import { TaskFunction } from './types';

const ctx: TaskWorker = self as any;

const _TASK_FUNCTIONS_CACHE: TaskFunctionsCache = {};

let _taskRunId: TaskRunId;
let _depsAreAlreadyImported: boolean = null;
let _generator: Generator = null;

ctx.onmessage = (message) => {
  const { data } = message;

  _taskRunId = data.taskRunId;

  const taskFuncArgs = normalizePostMessageData(
    data.args || [],
    _createFunction
  );

  if (data.next) {
    if (!_generator) {
      throw new NextIterationError('Generator function is already finished or was not initiated');
    }
    _reply(TaskEvent.STARTED);

    const startTime = performance.now();

    const iterationResult = _generator.next(...taskFuncArgs);
    if (iterationResult.done) {
      _generator = null;
    }

    if (iterationResult.value instanceof Promise) {
      iterationResult.value.then(_reply.bind(
        null,
        iterationResult.done
          ? TaskEvent.COMPLETED
          : TaskEvent.NEXT,
        { startTime }
      )).catch(_reply.bind(
        null, TaskEvent.ERROR, { startTime })
      );
      return;
    }

    _reply(
      iterationResult.done
        ? TaskEvent.COMPLETED
        : TaskEvent.NEXT,
      { startTime }, iterationResult.value
    );
    return;
  }

  // import scripts only the first time doesn't need to import them each time
  if (_depsAreAlreadyImported === null) {
    _depsAreAlreadyImported = (data.deps || []).length > 0;

    if (_depsAreAlreadyImported) {
      try {
        importScripts(...data.deps);
      } catch (e) {
        console.error(e);
      }
    }
  }

  const taskFunc = _createFunction(data.func);

  _reply(TaskEvent.STARTED);

  // to measure how long function is executed
  const startTime: number = performance.now();

  const taskFuncResult: TaskFunctionResult = taskFunc.apply({
    reply: (eventName: string, result: any) =>
      _reply(eventName, { startTime }, result)
  }, taskFuncArgs);

  if (isGeneratorFunc(taskFunc)) {
    const iterationResult: IteratorResult<any> = taskFuncResult.next(...taskFuncArgs);
    if (!iterationResult.done) {
      _generator = taskFuncResult;
    }
    if (iterationResult.value instanceof Promise) {
      _handlePromiseFunc(iterationResult.value, {
        startTime,
        resolveEventName: iterationResult.done
          ? TaskEvent.COMPLETED
          : TaskEvent.NEXT
      });
      return;
    }
    _reply(
      iterationResult.done
        ? TaskEvent.COMPLETED
        : TaskEvent.NEXT,
      { startTime },
      iterationResult.value
    );
    return;
  }

  if (taskFuncResult instanceof Promise) {
    _handlePromiseFunc(taskFuncResult, { startTime });
    return;
  }
  _reply(TaskEvent.COMPLETED, { startTime }, taskFuncResult);
};

ctx.onerror = (e: ErrorEvent) => {
  _reply(TaskEvent.ERROR, {}, { e });
};

function _createFunction(funcCode: string): TaskFunction {
  return createFuncFromStr(funcCode, { cache: _TASK_FUNCTIONS_CACHE });
}

function _handlePromiseFunc(
  promise: Promise<any>,
  {
    startTime = null,
    resolveEventName = TaskEvent.COMPLETED
  }: {
    startTime: number,
    resolveEventName?: TaskEvent.COMPLETED | TaskEvent.NEXT
  }
) {
  promise
    .then(_reply.bind(null, resolveEventName, { startTime }))
    .catch(_reply.bind(null, TaskEvent.ERROR, { startTime }));
}

function _reply(eventName: string, { startTime = null } = {}, result: any = null) {
  ctx.postMessage({
    eventName,
    result,
    taskRunId: _taskRunId,
    ...(
      startTime && {
        tookTime: performance.now() - startTime
      }
    )
  });
}

// for testing
export default (
  () => ctx
).bind(ctx);
