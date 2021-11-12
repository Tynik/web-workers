import type * as Brain from 'brain.js';

import {
  TaskFuncContext,
  TaskOptions
} from '../types';
import { Task } from '../task';
import { useTask } from './useTask';

export const useBrainJsTask = <Params extends any[], Result = any, EventsList extends string = any>(
  func: (this: TaskFuncContext<Result>, brain: typeof Brain, ...args: Params) => Result | Promise<Result> | void,
  brainJsVersion: string = 'latest',
  options: TaskOptions = {}
): Task<Params, Result> | null => {
  return useTask<Params, Result, EventsList>(function(this, ...args) {
    // brain variable it's the imported Brain.js library
    // @ts-ignore
    return args[0].call(this, brain, ...args.slice(1));
  }, {
    ...options,
    deps: [
      `https://unpkg.com/brain.js@${brainJsVersion}/dist/brain-browser.js`,
      ...options.deps || []
    ]
  }, [func]);
};
