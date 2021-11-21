import * as React from 'react';

import { useTask } from '@tynik/web-workers';

const ReactBaseExample = () => {
  const [summariseTaskResult, setSummariseTaskResult] =
    React.useState<{ result: number, tookTime: number }>(null);

  const [summariseTask] = useTask<[number[]], typeof summariseTaskResult['result']>(
    (value) => {
      return value.reduce((r, v) => r + v, 0);
    });

  React.useEffect(() => {
    if (!summariseTask) {
      return;
    }
    (
      async () => {
        const { result, tookTime } = await summariseTask.run([1, 2, 3, 4, 5]).whenCompleted();

        setSummariseTaskResult({ result, tookTime });
      }
    )();
  }, [summariseTask]);

  return (
    <>
      <p>Summarise task result: {summariseTaskResult ? summariseTaskResult.result : '?'}</p>
      <p>Took time: {summariseTaskResult ? summariseTaskResult.tookTime : '?'} ms</p>
    </>
  );
};

export default ReactBaseExample;
