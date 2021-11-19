import { EventCallback, EventAPI } from './events';

export type FuncId = string;

export type TaskFunction = Function
  | GeneratorFunction
  | AsyncGeneratorFunction;

export type TaskFunctionResult = Generator | any

export type TaskFunctionsCache = Record<FuncId, TaskFunction>

export enum TaskEvent {
  SENT = 'sent',
  STARTED = 'started',
  COMPLETED = 'completed',
  NEXT = 'next',
  ERROR = 'error'
}

export type Meta = {
  taskRunId: TaskRunId
  queueLength: number
  tookTime?: number
}

export type TaskOptions = {
  deps?: string[];
}

export interface RunTaskAPI<Params extends any[], Result = any, EventsList extends string = any> {
  whenSent: (callback: EventCallback<Meta>) => EventAPI;
  whenStarted: (callback: EventCallback<{ result: Result } & Meta>) => EventAPI;
  whenCompleted: (callback: EventCallback<{ result: Result } & Meta>) => EventAPI;
  next: (...nextArgs: Params) => Promise<{ result: Result } & Meta>;
}

export interface TaskFuncContext<Result = any, EventsList extends string = any> {
  reply: (eventName: string | TaskEvent, result: Result) => void;
}

interface TaskWorkerI {
  postMessage(message: TaskReplyMessage, transfer: Transferable[]): void;

  postMessage(message: TaskReplyMessage, options?: StructuredSerializeOptions): void;
}

export class TaskWorker extends Worker implements TaskWorkerI {
  onmessage: ((this: TaskWorker, ev: MessageEvent<FuncTaskMessage & GenTaskMessage>) => any) | null;
  onmessageerror: ((this: TaskWorker, ev: MessageEvent<FuncTaskMessage & GenTaskMessage>) => any) | null;
}
