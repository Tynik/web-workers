// DO NOT IMPORT ANYTHING HERE

declare type TaskRunId = string

declare type Message = {
  taskRunId: TaskRunId
  args: any[]
  func: string
  deps: string[]
  cacheTime: number
  isGenerator: boolean
  next: boolean
  customEvents: Record<string, string>
}

declare type ReplyMessage<Result = any, EventsList extends string = any> = {
  taskRunId: TaskRunId
  eventName: EventsList
  result: Result
  meta: {
    tookTime?: number
  }
}

declare module 'worker-loader!*' {
  class WebpackWorker<Result = any, EventsList extends string = any> extends Worker {
    constructor();

    onmessage: ((this: Worker, ev: MessageEvent<ReplyMessage<Result, EventsList>>) => any) | null;

    postMessage(message: Partial<Message>, transfer: Transferable[]): void;
    postMessage(message: Partial<Message>, options?: PostMessageOptions): void;
  }

  export default WebpackWorker;
}