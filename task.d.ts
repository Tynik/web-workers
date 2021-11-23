import { RunTaskAPI, TaskFunction, TaskOptions, Meta } from './types';
import { EventCallback } from './events';
export declare class Task<Params extends any[], Result = any, EventsList extends string = any> {
    private readonly func;
    private readonly deps;
    private readonly events;
    private worker;
    private stopped;
    private queueLength;
    constructor(func: TaskFunction, { deps }?: TaskOptions);
    whenEvent(eventName: string, callback: EventCallback<{
        result: Result;
    } & Meta>, once?: boolean): import("./events").EventAPI;
    whenNext(callback: EventCallback<{
        result: Result;
    } & Meta>, once?: boolean): import("./events").EventAPI;
    run(...args: Params): RunTaskAPI<Params, Result, EventsList>;
    stop(): void;
    private init;
    private addEvent;
    /**
     * Wrapper for adding events, but only execute a callback for a specific task run id.
     * Also, has two return interfaces: Event or Promise based.
     * If a callback is passed event-based return applied.
     */
    private whenRunEvent;
    private raiseEvent;
    private sendMsgToWorker;
}
