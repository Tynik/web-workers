import * as React from 'react';

import { useTask } from '@tynik/web-workers';

const ReactPromiseResultExample = () => {
  const [promiseTaskResult, setPromiseTaskResult] = React.useState<{
    result: string,
    tookTime: number
  }>(null);

  const [
    task,
    { isRunning: taskIsRunning }

  ] = useTask<[number], typeof promiseTaskResult['result']>(
    (wait) => {
      return new Promise((
        resolve => {
          setTimeout(() => resolve('ok'), wait);
        }
      ));
    });

  React.useEffect(() => {
    if (!task) {
      return;
    }
    const wait = 1500;

    task.run(wait)
      .whenCompleted((result, meta) => {
        setPromiseTaskResult({ result, tookTime: meta.tookTime });
      });
  }, [task]);

  return (
    <>
      <p>Task result: {promiseTaskResult ? promiseTaskResult.result : '?'}</p>
      <p>Took time: {promiseTaskResult ? promiseTaskResult.tookTime : '?'} ms</p>
      <p>Running: {taskIsRunning ? 'Yes' : 'No'}</p>
    </>
  );
};

export default ReactPromiseResultExample;
