import * as React from 'react';

import { RunTaskAPI, TaskFuncContext, TaskOptions } from '../types';
import { TaskEvent } from '../types';
import { Task } from '../task';

export type UseTaskStatus = {
  isRunning: boolean
  isCompleted: boolean
}

export const useTask = <Params extends any[], Result = any, EventsList extends string = any>(
  func: (this: TaskFuncContext<Result, EventsList>, ...args: Params) => Result | Promise<Result> | Generator<any> | void,
  options: TaskOptions<EventsList> = {},
  leftArgs: any[] = []
): [Task<Params, Result, EventsList> | null, UseTaskStatus] => {

  const [taskIsRunning, setTaskIsRunning] = React.useState<boolean>(null);
  const [taskIsCompleted, setTaskIsCompleted] = React.useState<boolean>(false);
  const [task, setTask] = React.useState<Task<Params, Result, EventsList>>(null);

  React.useEffect(() => {
    const task = new Task<Params, Result, EventsList>(func, options);

    task.whenEvent(() => {
      setTaskIsRunning(true);
    }, TaskEvent.STARTED);

    task.whenEvent(() => {
      setTaskIsRunning(false);
      setTaskIsCompleted(true);
    }, TaskEvent.COMPLETED);

    task.whenEvent(() => {
      setTaskIsRunning(false);
    }, TaskEvent.NEXT);

    task.whenEvent(() => {
      setTaskIsRunning(false);
    }, TaskEvent.ERROR);

    if (leftArgs.length) {
      const clonedRunFunc: (...args: typeof leftArgs[number] | Params) =>
        RunTaskAPI<Result> = task.run.bind(task);

      task.run = (...args) => clonedRunFunc(...leftArgs, ...args);
    }

    setTask(task);

    return () => {
      task.stop();
    };
  }, []);

  return [
    task,
    {
      isRunning: taskIsRunning,
      isCompleted: taskIsCompleted
    }
  ];
};
