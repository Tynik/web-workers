import * as React from 'react';

import { RunTaskAPI, TaskFuncContext, TaskOptions } from '../types';
import { TaskEvent } from '../types';
import { Task } from '../task';

export type UseTaskStatus = {
  isRunning: boolean
  queueLength: number
  isCompleted: boolean
}

export const useTask = <Params extends any[], Result = any, EventsList extends string = any>(
  func: (this: TaskFuncContext<Result, EventsList>, ...args: Params) => Result | Promise<Result> | Generator<any> | void,
  options: TaskOptions<EventsList> = {},
  leftArgs: any[] = []
): [Task<Params, Result, EventsList> | null, UseTaskStatus] => {

  const [taskIsRunning, setTaskIsRunning] = React.useState<boolean>(null);
  const [taskQueueLength, setTaskQueueLength] = React.useState<number>(0);
  const [taskIsCompleted, setTaskIsCompleted] = React.useState<boolean>(false);
  const [task, setTask] = React.useState<Task<Params, Result, EventsList>>(null);

  React.useEffect(() => {
    const task = new Task<Params, Result, EventsList>(func, options);

    task.whenEvent((result, { queueLength }) => {
      setTaskQueueLength(queueLength);
    }, TaskEvent.SENT);

    task.whenEvent(() => {
      setTaskIsRunning(true);
    }, TaskEvent.STARTED);

    task.whenEvent((result, { queueLength }) => {
      setTaskIsRunning(false);
      setTaskIsCompleted(true);
      setTaskQueueLength(queueLength);
    }, TaskEvent.COMPLETED);

    task.whenEvent(() => {
      setTaskIsRunning(false);
    }, TaskEvent.NEXT);

    task.whenEvent(() => {
      setTaskIsRunning(false);
    }, TaskEvent.ERROR);

    if (leftArgs.length) {
      const clonedRunFunc: (...args: typeof leftArgs[number] | Params) =>
        RunTaskAPI<Params, Result> = task.run.bind(task);

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
      queueLength: taskQueueLength,
      isCompleted: taskIsCompleted
    }
  ];
};
