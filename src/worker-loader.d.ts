// DO NOT IMPORT ANYTHING HERE

declare type TaskRunId = string

declare type FuncTaskMessage = {
  func: string
  args: any[]
  deps: string[]
}

declare type GeneratorNextTaskMessage = {
  next: boolean
  args: any[]
}

declare type GeneratorReturnTaskMessage = {
  return: boolean
  args: [any]
}

declare type GeneratorThrowTaskMessage = {
  throw: boolean
  args: [any]
}

declare type TaskMessage = {
  taskRunId: TaskRunId
} & (
  FuncTaskMessage
  | GeneratorNextTaskMessage
  | GeneratorReturnTaskMessage
  | GeneratorThrowTaskMessage
)

declare type TaskReplyMessage<Result = any, EventsList extends string = any> = {
  taskRunId: TaskRunId
  eventName: EventsList
  result: Result
  tookTime?: number
}

declare module 'worker-loader!*' {
  class WebpackWorker<Result = any, EventsList extends string = any> extends Worker {
    constructor();

    onmessage: ((this: Worker, ev: MessageEvent<TaskReplyMessage<Result, EventsList>>) => any) | null;
    onmessageerror: ((this: Worker, ev: MessageEvent<TaskReplyMessage<Result, EventsList>>) => any) | null;

    postMessage(message: TaskMessage, transfer: Transferable[]): void;
    postMessage(message: TaskMessage, options?: StructuredSerializeOptions): void;
  }

  export default WebpackWorker;
}
