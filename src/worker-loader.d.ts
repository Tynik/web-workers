// DO NOT IMPORT ANYTHING HERE

declare type TaskRunId = string

declare type FuncTaskMessage = {
  taskRunId: TaskRunId
  func: string
  args: any[]
  deps: string[]
}

declare type GenTaskMessage = {
  taskRunId: TaskRunId
  next: boolean
  args: any[]
}

declare type TaskMessage = FuncTaskMessage | GenTaskMessage;

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
