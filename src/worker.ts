import {
  isGenerator,
  PostMessageDataItem,
  normalizePostMessageData,
  createFunctionFromString
} from './utils';
import {
  TaskRunId,
  TaskFunctionsCache,
  TaskFunctionResult,
  TaskWorker,
  TaskEvent
} from './types';
import { NextIterationError } from './errors';

const ctx: TaskWorker = self as any;

const _CACHED_TASK_FUNCTIONS: TaskFunctionsCache = {};
const _GENERATORS: Record<TaskRunId, Generator> = {};

let _taskRunId;
let _depsAlreadyImported = null;

setInterval(() => {
  const currentTime = performance.now();

  Object.entries(_CACHED_TASK_FUNCTIONS).forEach(([k, v]) => {
    if (v.expired <= currentTime) {
      delete _CACHED_TASK_FUNCTIONS[k];
    }
  });
}, 1);

ctx.onmessage = (message) => {
  const { data } = message;

  _taskRunId = data.taskRunId;

  const taskFuncArgs = normalizePostMessageData(
    data.args || [], createFunctionFromString
  ) as PostMessageDataItem[];

  if (data.next) {
    if (!_GENERATORS[_taskRunId]) {
      throw new NextIterationError('Generator function is already finished or was not initiated');
    }
    _reply(TaskEvent.STARTED);

    const startTime = performance.now();

    const iterationResult = _GENERATORS[_taskRunId].next(...taskFuncArgs as any);
    if (iterationResult.done) {
      delete _GENERATORS[_taskRunId];
    }
    if (iterationResult.value instanceof Promise) {
      iterationResult.value.then(_reply.bind(
        null,
        iterationResult.done ? TaskEvent.COMPLETED : TaskEvent.NEXT,
        { startTime }
      )).catch(_reply.bind(
        null, TaskEvent.ERROR, { startTime })
      );
      return;
    }
    _reply(
      iterationResult.done ? TaskEvent.COMPLETED : TaskEvent.NEXT,
      { startTime }, iterationResult.value
    );
    return;
  }

  // import scripts only the first time doesn't need to import them each time
  if (_depsAlreadyImported === null) {
    _depsAlreadyImported = (data.deps || []).length > 0;

    if (_depsAlreadyImported) {
      try {
        importScripts(...data.deps);
      } catch (e) {
        console.error(e);
      }
    }
  }

  const taskFunc = createFunctionFromString(
    data.func,
    taskFuncArgs,
    { cache: _CACHED_TASK_FUNCTIONS }
  );

  _reply(TaskEvent.STARTED);

  // to measure how long function is executed
  const startTime: number = performance.now();

  const taskFuncResult: TaskFunctionResult = taskFunc.apply({
    events: data.customEvents,
    reply: (eventName: string, result: any) =>
      _reply(eventName, { startTime }, result)
  }, taskFuncArgs);

  if (isGenerator(taskFunc)) {
    const iterationResult: IteratorResult<any> = taskFuncResult.next(...taskFuncArgs);
    if (!iterationResult.done) {
      _GENERATORS[_taskRunId] = taskFuncResult;
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
      { startTime }, iterationResult.value
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
    meta: {
      ...(
        startTime && {
          tookTime: performance.now() - startTime
        }
      )
    }
  });
}

// for testing
export default (
  () => ctx
).bind(ctx);
