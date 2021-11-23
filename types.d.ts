export declare type TaskRunId = string;
export declare type FuncTaskMessage = {
    func: string;
    args: any[];
    deps: string[];
};
export declare type GeneratorNextTaskMessage = {
    next: boolean;
    args: any[];
};
export declare type GeneratorReturnTaskMessage = {
    return: boolean;
    args: [any];
};
export declare type GeneratorThrowTaskMessage = {
    throw: boolean;
    args: [any];
};
export declare type TaskMessage = FuncTaskMessage | GeneratorNextTaskMessage | GeneratorReturnTaskMessage | GeneratorThrowTaskMessage;
export declare type TaskReplyMessage<Result = any, EventsList extends string = any> = {
    taskRunId: TaskRunId;
    eventName: EventsList;
    result: Result;
    tookTime?: number;
};
export declare type FuncId = string;
export declare type TaskFunction = Function | GeneratorFunction | AsyncGeneratorFunction;
export declare type TaskFunctionResult = Generator | any;
export declare type TaskFunctionsCache = Record<FuncId, TaskFunction>;
export declare enum TaskEvent {
    SENT = "sent",
    STARTED = "started",
    COMPLETED = "completed",
    NEXT = "next",
    ERROR = "error"
}
export declare type Meta = {
    taskRunId: TaskRunId;
    queueLength: number;
    tookTime?: number;
};
export declare type TaskOptions = {
    deps?: string[];
};
export interface RunTaskAPI<Params extends any[], Result = any, EventsList extends string = any> {
    whenSent: Promise<Meta>;
    whenStarted: Promise<Meta>;
    whenCompleted: Promise<{
        result: Result;
    } & Meta>;
    whenError: Promise<{
        result: string;
    } & Meta>;
    next: (...args: Params) => Promise<{
        result: Result;
    } & Meta>;
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
export declare type TaskMessageEventData = {
    taskRunId: TaskRunId;
} & (FuncTaskMessage & GeneratorNextTaskMessage & GeneratorReturnTaskMessage & GeneratorThrowTaskMessage);
export declare class TaskWorker extends Worker implements TaskWorkerI {
    onmessage: ((this: TaskWorker, ev: MessageEvent<TaskMessageEventData>) => any) | null;
    onmessageerror: ((this: TaskWorker, ev: MessageEvent<TaskMessageEventData>) => any) | null;
}
export {};
