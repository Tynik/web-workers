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
  func: (
    this: TaskFuncContext<Result, EventsList>, ...args: Params) => Result | Promise<Result> | Generator<any> | void,
  options: TaskOptions = {},
  leftArgs: any[] = []
): [Task<Params, Result, EventsList> | null, UseTaskStatus] => {

  const [taskIsRunning, setTaskIsRunning] = React.useState<boolean>(null);
  const [taskQueueLength, setTaskQueueLength] = React.useState<number>(0);
  const [taskIsCompleted, setTaskIsCompleted] = React.useState<boolean>(false);
  const [task, setTask] = React.useState<Task<Params, Result, EventsList>>(null);

  React.useEffect(() => {
    const task = new Task<Params, Result, EventsList>(func, options);

    task.whenEvent(TaskEvent.SENT, ({ queueLength }) => {
      setTaskQueueLength(queueLength);
    });

    task.whenEvent(TaskEvent.STARTED, () => {
      setTaskIsRunning(true);
    });

    task.whenEvent(TaskEvent.COMPLETED, ({ queueLength }) => {
      setTaskIsRunning(false);
      setTaskIsCompleted(true);
      setTaskQueueLength(queueLength);
    });

    task.whenEvent(TaskEvent.NEXT, () => {
      setTaskIsRunning(false);
    });

    task.whenEvent(TaskEvent.ERROR, () => {
      setTaskIsRunning(false);
    });

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
