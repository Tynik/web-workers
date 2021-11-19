import Worker from 'worker-loader!./worker';
import {
  TaskRunId,
  RunTaskAPI,
  TaskEvent,
  TaskFunction,
  TaskOptions,
  Meta
} from './types';
import { EventCallback, Events } from './events';
import { denormalizePostMessageData, genId } from './utils';

export class Task<Params extends any[], Result = any, EventsList extends string = any> {
  private readonly func: TaskFunction;
  private readonly deps: string[];
  private readonly events: Events<EventsList>;

  private worker: Worker;
  private stopped: boolean;
  private queueLength: number;

  constructor(
    func: TaskFunction,
    {
      deps = []
    }: TaskOptions = {}
  ) {
    this.func = func;
    this.deps = deps;

    this.events = new Events();

    this.init();
  }

  whenEvent(eventName: string, callback: EventCallback<{ result: Result } & Meta>, once = false) {
    return this.events.add(eventName, callback, once);
  }

  whenNext(callback: EventCallback<{ result: Result } & Meta>, once = false) {
    return this.events.add(TaskEvent.NEXT, callback, once);
  }

  run(...args: Params): RunTaskAPI<Params, Result, EventsList> {
    if (this.stopped) {
      // re-init if stopped by timer or another action
      this.init();
    }
    const taskRunId: TaskRunId = genId();

    queueMicrotask(() => {
      this.queueLength++;

      this.worker.postMessage({
        taskRunId,
        func: String(this.func),
        args: denormalizePostMessageData(args),
        deps: this.deps
      });

      this.events.raise<Meta>(TaskEvent.SENT, {
        taskRunId,
        queueLength: this.queueLength
      });
    });

    return {
      whenSent: this.whenRunEvent.bind(null, TaskEvent.SENT, taskRunId),
      whenStarted: this.whenRunEvent.bind(null, TaskEvent.STARTED, taskRunId),
      whenCompleted: this.whenRunEvent.bind(null, TaskEvent.COMPLETED, taskRunId),
      next: (...nextArgs) => {
        const taskRunId: TaskRunId = genId();

        queueMicrotask(() => {
          this.queueLength++;

          this.worker.postMessage({
            taskRunId,
            next: true,
            args: denormalizePostMessageData(nextArgs)
          });

          this.events.raise<Meta>(TaskEvent.SENT, {
            taskRunId,
            queueLength: this.queueLength
          });
        });

        return new Promise<{ result: Result } & Meta>((resolve, reject) => {
          this.whenRunEvent(TaskEvent.NEXT, taskRunId, resolve);
          this.whenRunEvent(TaskEvent.ERROR, taskRunId, reject);
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
      const { data: { taskRunId, eventName, result, tookTime } } = message;

      if ([TaskEvent.COMPLETED, TaskEvent.NEXT, TaskEvent.ERROR].includes(eventName)) {
        this.queueLength--;
      }

      this.events.raise<{ result: Result } & Meta>(eventName, {
        taskRunId,
        result,
        tookTime,
        queueLength: this.queueLength
      });
    };
  }

  private whenRunEvent = <R extends { result: Result } & Meta>(
    eventName: string,
    taskRunId: TaskRunId,
    callback: EventCallback<R>
  ) => {
    return this.events.add<R>(
      eventName,
      (result) => {
        if (result.taskRunId !== taskRunId) {
          // should not remove event callback
          return false;
        }
        callback(result);
      },
      true
    );
  };
}
