import {
  CreateGeneratorFunctionFromStr,
  isGenerator,
  PostMessageDataItem,
  normalizePostMessageData,
  generateTaskFuncId
} from './utils';
import {
  FuncId,
  TaskRunId,
  TaskFunction,
  TaskFunctionResult,
  TaskWorker,
  TaskEventName
} from './types';
import {
  FuncSyntaxError,
  GenFuncSyntaxError,
  NextIterationError
} from './errors';

const ctx: TaskWorker = self as any;

const _CACHED_TASK_FUNCTIONS: Record<FuncId, {
  func: TaskFunction
  expired?: number
}> = {};
const _GENERATORS: Record<TaskRunId, Generator> = {};

let _taskRunId;
let _depsAlreadyImported = false;

setInterval(() => {
  const currentTime = performance.now();

  Object.entries(_CACHED_TASK_FUNCTIONS).forEach(([k, v]) => {
    if (v.expired <= currentTime) {
      delete _CACHED_TASK_FUNCTIONS[k];
    }
  });
}, .01);

ctx.onmessage = (message) => {
  const { data } = message;

  if (!data.taskRunId) {
    throw new Error('taskRunId is required param for a task');
  }
  _taskRunId = data.taskRunId;

  if (data.next) {
    if (!_GENERATORS[_taskRunId]) {
      throw new NextIterationError('Generator function is already finished or was not initiated');
    }
    const startTime = performance.now();

    const iterationResult = _GENERATORS[_taskRunId].next(data.args[0]);
    if (iterationResult.done) {
      delete _GENERATORS[_taskRunId];
    }
    if (iterationResult.value instanceof Promise) {
      iterationResult.value.then(_reply.bind(
        null,
        iterationResult.done ? TaskEventName.COMPLETED : TaskEventName.NEXT,
        { startTime }
      )).catch(_reply.bind(
        null, TaskEventName.ERROR, { startTime })
      );
      return;
    }
    _reply(
      iterationResult.done ? TaskEventName.COMPLETED : TaskEventName.NEXT,
      { startTime }, iterationResult.value
    );
    return;
  }
  // import scripts only the first time doesn't need to import them each time
  if (!_depsAlreadyImported && (
    data.deps || []
  ).length) {
    _depsAlreadyImported = true;
    try {
      importScripts.apply(null, data.deps);
    } catch (e) {
      console.error(e);
    }
  }
  const taskFuncArgs = normalizePostMessageData(
    data.args || [], _createTaskFuncFromStr
  ) as PostMessageDataItem[];

  const taskFunc = _createTaskFuncFromStr(data.func, taskFuncArgs);

  _reply(TaskEventName.STARTED, {});

  // to measure how much a function executed
  const startTime: number = performance.now();

  const taskFuncResult: TaskFunctionResult = taskFunc.apply({
    events: data.customEvents,
    reply: (eventName: string, result: any) =>
      _reply(eventName, { startTime }, result)
  }, taskFuncArgs);

  if (isGenerator(taskFunc)) {
    const iterationResult: IteratorResult<any> = taskFuncResult.next(data.args[0]);
    if (!iterationResult.done) {
      _GENERATORS[_taskRunId] = taskFuncResult;
    }
    if (iterationResult.value instanceof Promise) {
      _handlePromiseFunc(iterationResult.value, {
        startTime,
        successEventName: iterationResult.done ? TaskEventName.COMPLETED : TaskEventName.NEXT
      });
      return;
    }
    _reply(
      iterationResult.done ? TaskEventName.COMPLETED : TaskEventName.NEXT,
      { startTime }, iterationResult.value
    );
    return;
  }

  if (taskFuncResult instanceof Promise) {
    _handlePromiseFunc(taskFuncResult, { startTime });
    return;
  }
  _reply(TaskEventName.COMPLETED, { startTime }, taskFuncResult);
};

ctx.onerror = (e: ErrorEvent) => {
  _reply(TaskEventName.ERROR, {}, { e });
};

function _handlePromiseFunc(
  promise: Promise<any>,
  { startTime = null, successEventName = TaskEventName.COMPLETED }: { startTime: number, successEventName?: string }
) {
  promise
    .then(_reply.bind(null, successEventName, { startTime }))
    .catch(_reply.bind(null, TaskEventName.ERROR, { startTime }));
}

function _reply(eventName, { startTime = null }, result: any = null) {
  ctx.postMessage({
    eventName,
    result,
    taskRunId: _taskRunId,
    meta: {
      ...(
        startTime && { tookTime: performance.now() - startTime }
      )
    }
  });
}

function _updateCacheFuncExpiredTime(funcId: FuncId, cacheTime: number) {
  _CACHED_TASK_FUNCTIONS[funcId].expired = performance.now() + cacheTime;
}

function _createTaskFuncFromStr(
  funcCode: string,
  args: any[] = [],
  { cacheTime }: { cacheTime: number } = { cacheTime: null }
): TaskFunction {

  let funcId = generateTaskFuncId(funcCode, args);
  if (_CACHED_TASK_FUNCTIONS[funcId]) {
    if (cacheTime) {
      _updateCacheFuncExpiredTime(funcId, cacheTime);
    }
    return _CACHED_TASK_FUNCTIONS[funcId].func;
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
  const funcBody = funcCode.substring(funcCode.indexOf('{', endFuncArgs) + 1, funcCode.length - 1);

  const generatorMark = funcCode.indexOf('*');
  let isGeneratorFunc = false;
  if (generatorMark !== -1) {
    if (generatorMark > startFuncArgsFrom) {
      throw new GenFuncSyntaxError();
    }
    isGeneratorFunc = true;
  }
  const func: TaskFunction = isGeneratorFunc
    ? CreateGeneratorFunctionFromStr(funcArgs, funcBody)
    : new Function(funcArgs, funcBody);

  if (cacheTime) {
    _CACHED_TASK_FUNCTIONS[funcId] = { func };
    _updateCacheFuncExpiredTime(funcId, cacheTime);
  }
  return func;
}

// for testing
export default (
  () => ctx
).bind(ctx);
