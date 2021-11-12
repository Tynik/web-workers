import * as React from 'react';

import { useTask } from '../../hooks';

const PromiseResultExample = () => {
  const [promiseTaskResult, setPromiseTaskResult] =
    React.useState<{ result: string, tookTime: number }>(null);

  const [
    summariseTask,
    { isRunning: summariseTaskIsRunning }
    
  ] = useTask<[number], typeof promiseTaskResult['result']>(
    (wait) => {
      return new Promise((
        resolve => {
          setTimeout(() => resolve('ok'), wait);
        }
      ));
    });

  React.useEffect(() => {
    if (!summariseTask) {
      return;
    }
    const wait = 1000;

    summariseTask.run(wait)
      .whenCompleted((result, meta) => {
        setPromiseTaskResult({ result, tookTime: meta.tookTime });
      });
  }, [summariseTask]);

  return (
    <>
      <p>Summarise task result: {promiseTaskResult ? promiseTaskResult.result : '?'}</p>
      <p>Took time: {promiseTaskResult ? promiseTaskResult.tookTime : '?'} ms</p>
      <p>Running: {summariseTaskIsRunning ? 'Yes' : 'No'}</p>
    </>
  );
};

export default PromiseResultExample;
