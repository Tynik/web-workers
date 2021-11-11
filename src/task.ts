import Worker from 'worker-loader!./worker';
import { DenormalizedPostMessageDataItem, denormalizePostMessageData, ID } from './utils';
import {
  EventAPI,
  EventCallback,
  TaskEventName,
  Events,
  RunTaskAPI,
  TaskFunction,
  TaskOptions,
  TaskRunId
} from './types';

export class Task<Params extends any[], Result = any, EventsList extends string = any> {
  private readonly func: TaskFunction;
  private readonly deps: string[];
  private readonly timeout: number;
  private readonly cacheTime: number;
  private readonly events: Events<EventsList | TaskEventName>;
  private readonly customEvents: Record<Uppercase<EventsList>, any>;
  private clearTimerEvents: any[];
  private worker: Worker;
  private stopped: boolean;
  private queueLength: number;

  constructor(func: TaskFunction, { deps = [], timeout = null, cacheTime = null, customEvents = null }: TaskOptions = {}) {
    this.func = func;
    this.deps = deps;
    this.timeout = timeout;
    this.cacheTime = cacheTime;
    this.customEvents = customEvents;
    this.events = {};
    this.clearTimerEvents = [];

    this.init();
  }

  whenEvent(
    callback: EventCallback<any>,
    eventName: EventsList | TaskEventName,
    { taskRunId, once } = { taskRunId: null, once: false }
  ): EventAPI {
    return this.newEvent(callback, eventName || TaskEventName.DEFAULT, { taskRunId, once });
  }

  whenError(callback: EventCallback<any>, { once } = { once: false }): EventAPI {
    return this.newEvent(callback, TaskEventName.ERROR, { taskRunId: null, once });
  }

  run(...args: Params): RunTaskAPI<Result, EventsList> {
    const taskRunId: TaskRunId = ID();

    if (this.stopped) {
      // re-init if stopped by timer or another action
      this.init();
    }
    this.queueLength++;

    if (this.timeout) {
      const timer = setTimeout(() => {
        this.clearTimerEvents = [];
        // if queue length > 0, so the tasks in queue will be canceled
        if (this.queueLength) {
          console.log(`taskRunId: ${taskRunId}. Queue is not empty. ${this.queueLength} tasks left`);
        }
        this.stop();

        this.raiseEvent(TaskEventName.ERROR, { result: null, timeout: true, taskRunId });
      }, this.timeout * 1000);

      const clearTimer = clearTimeout.bind(null, timer);

      // clear timer when the task completed or some error occurred
      this.clearTimerEvents.push(this.whenEvent(clearTimer, TaskEventName.COMPLETED, { taskRunId: null, once: true }));
      this.clearTimerEvents.push(this.whenError(clearTimer, { once: true }));
    }

    queueMicrotask(() => {
      this.worker.postMessage({
        func: String(this.func),
        args: denormalizePostMessageData(args) as DenormalizedPostMessageDataItem[],
        deps: this.deps,
        cacheTime: this.cacheTime,
        customEvents: this.customEvents,
        taskRunId
      });
    });

    return {
      whenEvent: (callback, eventName) => {
        return this.whenEvent(callback, eventName, { taskRunId, once: false });
      },
      whenCompleted: (callback) => {
        return this.whenEvent(callback, TaskEventName.COMPLETED, { taskRunId, once: true });
      },
      // --- For asynchronous functions
      whenNext: (callback) => {
        return this.whenEvent(callback, TaskEventName.NEXT, { taskRunId, once: false });
      },
      next: (passValue?) => {
        this.queueLength++;
        this.worker.postMessage({
          next: true,
          args: [passValue],
          taskRunId
        });
      }
    };
  };

  stop() {
    this.worker.terminate();
    this.stopped = true;
    this.queueLength = 0;
  }

  private init() {
    this.queueLength = 0;
    this.stopped = false;

    this.worker = new Worker<Result, EventsList>();
    this.worker.onmessage = (message) => {
      const { data: { taskRunId, eventName, result, meta } } = message;

      if ([TaskEventName.COMPLETED, TaskEventName.NEXT, TaskEventName.ERROR].includes(eventName)) {
        this.queueLength--;
      }
      this.raiseEvent<Result>(eventName, {
        result,
        taskRunId,
        tookTime: meta.tookTime
      });
    };
  }

  private newEvent(
    callback: EventCallback<any>,
    eventName: EventsList | TaskEventName,
    { taskRunId = null, once = false }: { taskRunId: TaskRunId, once: boolean }
  ): EventAPI {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push({ callback, taskRunId, once });

    const index = this.events[eventName].length - 1;
    return {
      remove: () => {
        this.events[eventName].splice(index, 1);
      }
    };
  }

  private raiseEvent<Result>(
    eventName: EventsList | TaskEventName,
    {
      result,
      taskRunId,
      tookTime = null,
      timeout = false
    }: {
      result: Result,
      taskRunId: TaskRunId,
      tookTime?: number,
      timeout?: boolean
    }
  ) {
    eventName = eventName || TaskEventName.DEFAULT;
    (
      this.events[eventName] || []
    ).forEach(({ callback, taskRunId: _taskRunId, once }, index) => {
      if (taskRunId !== _taskRunId) {
        return;
      }
      try {
        callback(result, { tookTime });
      } finally {
        if (once) {
          this.events[eventName].splice(index, 1);
        }
      }
    });
  }
}

//
// export class TasksPool {
//   private concurrency: number;
//   private readonly tasks: Task[] = [];
//
//   constructor(concurrency: number = navigator.hardwareConcurrency) {
//     this.concurrency = concurrency;
//
//     for (let i = 0; i < concurrency; i++) {
//       this.tasks.push(new Task());
//     }
//   }
//
//   stopAll() {
//     this.tasks.forEach((task: Task) => task.stop());
//   }
// }
