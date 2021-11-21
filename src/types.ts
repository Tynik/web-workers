import { EventCallback, EventAPI } from './events';

// <--------- THESE TYPES ARE DUPLICATED WITH worker-loader.d.ts --------->
export type TaskRunId = string

export type FuncTaskMessage = {
  func: string
  args: any[]
  deps: string[]
}

export type GeneratorNextTaskMessage = {
  next: boolean
  args: any[]
}

export type GeneratorReturnTaskMessage = {
  return: boolean
  args: [any]
}

export type GeneratorThrowTaskMessage = {
  throw: boolean
  args: [any]
}

export type TaskMessage = FuncTaskMessage
  | GeneratorNextTaskMessage
  | GeneratorReturnTaskMessage
  | GeneratorThrowTaskMessage

export type TaskReplyMessage<Result = any, EventsList extends string = any> = {
  taskRunId: TaskRunId
  eventName: EventsList
  result: Result
  tookTime?: number
}
// </--------- THESE TYPES ARE DUPLICATED WITH worker-loader.d.ts --------->

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
  whenSent: () => Promise<Meta>;
  whenStarted: () => Promise<Meta>;
  whenCompleted: () => Promise<{ result: Result } & Meta>;
  whenError: () => Promise<{ result: string } & Meta>;
  next: (...args: Params) => Promise<{ result: Result } & Meta>;
  return: (value?: any) => void;
  throw: (e?: any) => void;
}

export interface TaskFuncContext<Result = any, EventsList extends string = any> {
  reply: (eventName: string | TaskEvent, result: Result) => void;
}

interface TaskWorkerI {
  postMessage(message: TaskReplyMessage, transfer: Transferable[]): void;

  postMessage(message: TaskReplyMessage, options?: StructuredSerializeOptions): void;
}

export type TaskMessageEventData = {
  taskRunId: TaskRunId
} & (
  FuncTaskMessage
  & GeneratorNextTaskMessage
  & GeneratorReturnTaskMessage
  & GeneratorThrowTaskMessage
);

export class TaskWorker extends Worker implements TaskWorkerI {
  onmessage: ((this: TaskWorker, ev: MessageEvent<TaskMessageEventData>) => any) | null;
  onmessageerror: ((this: TaskWorker, ev: MessageEvent<TaskMessageEventData>) => any) | null;
}
