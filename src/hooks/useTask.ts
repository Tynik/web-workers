import * as React from 'react';

import {
  RunTaskAPI,
  TaskFuncContext,
  TaskOptions
} from '../types';
import { Task } from '../task';

export const useTask = <Params extends any[], Result = any, EventsList extends string = any>(
  func: (this: TaskFuncContext<Result, EventsList>, ...args: Params) => Result | void,
  options: TaskOptions<EventsList> = {},
  leftArgs: any[] = []
): Task<Params, Result, EventsList> | null => {
  const [task, setTask] = React.useState<Task<Params, Result, EventsList>>(null);

  React.useEffect(() => {
    const task = new Task<Params, Result, EventsList>(func, options);
    setTask(task);

    if (leftArgs.length) {
      const clonedRunFunc: (...args: typeof leftArgs[number] | Params) =>
        RunTaskAPI<Result> = task.run.bind(task);

      task.run = (...args) => clonedRunFunc(...leftArgs, ...args);
    }

    return () => {
      task.stop();
    };
  }, []);

  return task;
};
