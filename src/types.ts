export type FuncId = string;
export type TaskRunId = string;

export type TaskFunction = Function
  | GeneratorFunction
  | AsyncGeneratorFunction;

export type TaskFunctionResult = Generator | any

export enum TaskEventName {
  DEFAULT = 'default',
  STARTED = 'started',
  COMPLETED = 'completed',
  NEXT = 'next',
  ERROR = 'error'
}

export type Meta = {
  tookTime?: number
}

export type RequestMessageEventData = {
  taskRunId: TaskRunId
  func: string
  next?: boolean
  deps?: string[]
  args?: any[]
  customEvents: Record<string, string>
  cacheTime?: number
};

export type EventCallback<Result = any, Meta = any> = (result: Result, meta: Meta) => void

export type Event<Result = any, Meta = any> = {
  callback: EventCallback<Result, Meta>
  taskRunId: TaskRunId
  once: boolean
};

export type Events<EventsList extends string> =
  Partial<Record<EventsList, Event<any, Meta>[]>>

export interface EventAPI {
  remove: () => void;
}

export type TaskOptions<EventsList extends string = any> = {
  deps?: string[];
  timeout?: number;
  cacheTime?: number;
  customEvents?: Record<Uppercase<EventsList>, string>;
}

export interface RunTaskAPI<Result = any, EventsList extends string = any> {
  whenEvent: (callback: EventCallback<Result, Meta>, eventName: EventsList | TaskEventName) => EventAPI;
  whenNext: (callback: EventCallback<[any], Meta>) => EventAPI;
  whenCompleted: (callback: EventCallback<Result, Meta>) => EventAPI;
  next: (passValue?: any) => void;
}

export interface TaskFuncContext<Result = any, EventsList extends string = any, Ev = Record<Uppercase<EventsList>, any>> {
  events: Ev;
  reply: (eventName: Ev | string | TaskEventName, result: Result) => void;
}

export class TaskWorker extends Worker {
  onmessage: ((this: TaskWorker, ev: MessageEvent<RequestMessageEventData>) => any) | null;
  onmessageerror: ((this: TaskWorker, ev: MessageEvent<RequestMessageEventData>) => any) | null;
}
