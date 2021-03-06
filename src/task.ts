import Worker from 'worker-loader!./worker';
import {
  TaskRunId,
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

    const ctx = this;
    return {
      get whenSent() {
        return ctx.whenRunEvent(TaskEvent.SENT, taskRunId);
      },
      get whenStarted() {
        return ctx.whenRunEvent(TaskEvent.STARTED, taskRunId);
      },
      get whenCompleted() {
        return ctx.whenRunEvent(TaskEvent.COMPLETED, taskRunId);
      },
      get whenError() {
        return ctx.whenRunEvent(TaskEvent.ERROR, taskRunId);
      },
      next: (...args) => {
        const taskRunId: TaskRunId = genId();

        this.sendMsgToWorker<GeneratorNextTaskMessage>(taskRunId, {
          next: true,
          // only for run method the arguments should be denormalized
          args
        });

        return this.whenRunEvent(TaskEvent.NEXT, taskRunId);
      },
      return: (value) => {
        const taskRunId: TaskRunId = genId();

        this.sendMsgToWorker<GeneratorReturnTaskMessage>(taskRunId, {
          return: true,
          // only for run method the arguments should be denormalized
          args: [value]
        });
      },
      throw: (e) => {
        const taskRunId: TaskRunId = genId();

        this.sendMsgToWorker<GeneratorThrowTaskMessage>(taskRunId, {
          throw: true,
          // only for run method the arguments should be denormalized
          args: [e]
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

      this.raiseEvent<Result>(eventName, taskRunId, {
        result,
        tookTime
      });
    };
  }

  private addEvent<Result = any, EventResult extends { result: Result } & Meta = any>(
    eventName: string,
    taskRunId: TaskRunId,
    callback: EventCallback<EventResult>
  ) {
    return this.events.add<EventResult>(
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
  }

  /**
   * Wrapper for adding events, but only execute a callback for a specific task run id.
   * Also, has two return interfaces: Event or Promise based.
   * If a callback is passed event-based return applied.
   */
  private whenRunEvent<Result = any, EventResult extends { result: Result } & Meta = any>(
    eventName: string,
    taskRunId: TaskRunId
  ) {
    return new Promise<EventResult>((
      (resolve, reject) => {
        this.addEvent<Result>(eventName, taskRunId, resolve);
        this.addEvent(TaskEvent.ERROR, taskRunId, reject);
      }
    ));
  };

  private raiseEvent<Result = any, EventResult = { result?: Result }>(
    eventName: string,
    taskRunId: TaskRunId,
    // can accept meta fields besides taskRunId and queueLength
    result?: EventResult & Omit<Meta, 'taskRunId' | 'queueLength'>
  ) {
    this.events.raise<EventResult & Meta>(eventName, {
      taskRunId,
      queueLength: this.queueLength,
      ...result
    });
  }

  private sendMsgToWorker<Message extends TaskMessage>(
    taskRunId: TaskRunId,
    message: Message
  ) {
    queueMicrotask(() => {
      this.queueLength++;

      // each message to worker should have taskRunId to know which event should be called after
      this.worker.postMessage({
        taskRunId,
        ...message
      });

      this.raiseEvent(TaskEvent.SENT, taskRunId);
    });
  };
}
