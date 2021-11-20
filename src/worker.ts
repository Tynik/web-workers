import {
  isGeneratorFunc,
  normalizePostMessageData,
  createFuncFromStr
} from './utils';
import {
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
let _currentGeneratorTask: Generator = null;

ctx.onmessage = (message) => {
  const { data } = message;

  _taskRunId = data.taskRunId;

  if (data.next || data.return || data.throw) {
    if (!_currentGeneratorTask) {
      throw new NextIterationError('Generator function is already finished or was not initiated');
    }
    _reply(TaskEvent.STARTED);

    const startTime = performance.now();

    let iterationResult;
    if (data.next) {
      iterationResult = _currentGeneratorTask.next(...data.args as any);

    } else if (data.return) {
      iterationResult = _currentGeneratorTask.return(data.args[0]);

    } else {
      iterationResult = _currentGeneratorTask.throw(data.args[0]);
    }

    if (iterationResult.done || data.throw) {
      // clear generator task and after that generator cannot be accessed
      _currentGeneratorTask = null;
    }

    const replyEventName = data.throw || iterationResult.done
      ? TaskEvent.COMPLETED
      : TaskEvent.NEXT;

    if (!data.throw && iterationResult.value instanceof Promise) {
      iterationResult.value
        .then((result) => _reply(replyEventName, { startTime }, result))
        .catch((reason) => _reply(TaskEvent.ERROR, { startTime }, reason));

      return;
    }

    _reply(replyEventName, { startTime }, iterationResult.value);
    return;
  }

  // import scripts only the first time doesn't need to import them each time
  if (_depsAreAlreadyImported === null) {
    _depsAreAlreadyImported = (
      data.deps || []
    ).length > 0;

    if (_depsAreAlreadyImported) {
      try {
        importScripts(...data.deps);
      } catch (e) {
        console.error(e);
      }
    }
  }

  const taskFunc = _createFunction(data.func);

  const taskFuncArgs = normalizePostMessageData(
    data.args || [],
    _createFunction
  );

  // propagate that context for each task function
  const taskFuncContext = {
    reply: (eventName: string, result: any) =>
      _reply(eventName, { startTime }, result)
  };

  _reply(TaskEvent.STARTED);

  // to measure how long function is executed
  const startTime: number = performance.now();

  const taskFuncResult: TaskFunctionResult = taskFunc.apply(taskFuncContext, taskFuncArgs);

  if (isGeneratorFunc(taskFunc)) {
    const iterationResult: IteratorResult<any> = taskFuncResult.next(...taskFuncArgs);
    if (!iterationResult.done) {
      _currentGeneratorTask = taskFuncResult;
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
    .then((result) => _reply(resolveEventName, { startTime }, result))
    .catch((reason) => _reply(TaskEvent.ERROR, { startTime }, reason));
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
