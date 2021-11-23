import { TaskFuncContext, TaskOptions } from '../types';
import { Task } from '../task';
export declare type UseTaskStatus = {
    isRunning: boolean;
    queueLength: number;
    isCompleted: boolean;
};
export declare const useTask: <Params extends any[], Result = any, EventsList extends string = any>(func: (this: TaskFuncContext<Result, EventsList>, ...args: Params) => void | Result | Promise<Result> | Generator<any, any, unknown>, options?: TaskOptions, leftArgs?: any[]) => [Task<Params, Result, EventsList>, UseTaskStatus];
