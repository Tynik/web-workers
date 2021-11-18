import type * as Brain from 'brain.js';

import {
  TaskFuncContext,
  TaskOptions
} from '../types';
import { useTask } from './useTask';
import { isGeneratorFunc } from '../utils';

export const useBrainJsTask = <Params extends any[], Result = any, EventsList extends string = any>(
  func: (
    this: TaskFuncContext<Result>, brain: typeof Brain,
    ...args: Params
  ) => Result | Promise<Result> | Generator<any> | void,
  brainJsVersion: string = 'latest',
  options: TaskOptions = {}
) => {
  let taskFunc;

  if (isGeneratorFunc(func)) {
    taskFunc = function* (this, ...args) {
      // brain variable it's the imported Brain.js library
      // @ts-expect-error
      yield* args[0].call(this, brain, ...args.slice(1));
    };
  } else {
    taskFunc = function(this, ...args) {
      // @ts-expect-error
      return args[0].call(this, brain, ...args.slice(1));
    };
  }

  return useTask<Params, Result, EventsList>(taskFunc, {
    ...options,
    deps: [
      `https://unpkg.com/brain.js@${brainJsVersion}/dist/brain-browser.js`,
      ...options.deps || []
    ]
  }, [func]);
};
