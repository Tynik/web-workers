import type * as Brain from 'brain.js';
import { TaskFuncContext, TaskOptions } from '../types';
export declare const useBrainJsTask: <Params extends any[], Result = any, EventsList extends string = any>(func: (this: TaskFuncContext<Result, any>, brain: typeof Brain, ...args: Params) => void | Generator<any, any, unknown> | Result | Promise<Result>, brainJsVersion?: string, options?: TaskOptions) => [import("..").Task<Params, Result, EventsList>, import("./useTask").UseTaskStatus];
