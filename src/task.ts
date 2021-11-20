import Worker from 'worker-loader!./worker';
import {
  RunTaskAPI,
  TaskEvent,
  TaskFunction,
  TaskOptions,
  Meta,
  TaskMessage,
  FuncTaskMessage,
  GeneratorNextTaskMessage,
  GeneratorReturnTaskMessage,
  GeneratorThrowTaskMessage
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

    this.sendMsgToWorker<FuncTaskMessage>(taskRunId, {
      func: String(this.func),
      args: denormalizePostMessageData(args),
      deps: this.deps
    });

    return {
      whenSent: (callback) =>
        this.whenRunEvent(TaskEvent.SENT, taskRunId, callback),

      whenStarted: (callback) =>
        this.whenRunEvent(TaskEvent.STARTED, taskRunId, callback),

      whenCompleted: (callback) =>
        this.whenRunEvent(TaskEvent.COMPLETED, taskRunId, callback),

      next: (...args) => {
        const taskRunId: TaskRunId = genId();

        this.sendMsgToWorker<GeneratorNextTaskMessage>(taskRunId, {
          next: true,
          args
        });

        return new Promise<{ result: Result } & Meta>((resolve, reject) => {
          this.whenRunEvent(TaskEvent.NEXT, taskRunId, resolve);
          this.whenRunEvent(TaskEvent.ERROR, taskRunId, reject);
        });
      },
      return: (value) => {
        const taskRunId: TaskRunId = genId();

        this.sendMsgToWorker<GeneratorReturnTaskMessage>(taskRunId, {
          return: true,
          args: [value]
        });
      },
      throw: (e) => {
        const taskRunId: TaskRunId = genId();

        this.sendMsgToWorker<GeneratorThrowTaskMessage>(taskRunId, {
          throw: true,
          args: [e],
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

  /**
   * Wrapper for adding events, but only execute a callback for a specific task run id
   */
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

  private sendMsgToWorker = <Message extends TaskMessage>(taskRunId: TaskRunId, message: Message) => {
    queueMicrotask(() => {
      this.queueLength++;

      this.worker.postMessage({
        taskRunId,
        ...message
      });

      this.events.raise<Meta>(TaskEvent.SENT, {
        taskRunId,
        queueLength: this.queueLength
      });
    });
  };
}
