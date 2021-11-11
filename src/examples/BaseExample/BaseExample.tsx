import * as React from 'react';

import { useTask } from '../../hooks';

const BaseExample = () => {
  const [summariseTaskResult, setSummariseTaskResult] =
    React.useState<{ result: number, tookTime: number }>(null);

  const summariseTask = useTask<[number[]], typeof summariseTaskResult['result']>(
    function(this, value) {
      return value.reduce((r, v) => r + v, 0);
    });

  React.useEffect(() => {
    if (!summariseTask) {
      return;
    }
    summariseTask.run([1, 2, 3, 4, 5])
      .whenCompleted((result, meta) => {
        setSummariseTaskResult({ result, tookTime: meta.tookTime });
      });
  }, [summariseTask]);

  return (
    <>
      <p>Summarise task result: {summariseTaskResult ? summariseTaskResult.result : '?'}</p>
      <p>Took time: {summariseTaskResult ? summariseTaskResult.tookTime : '?'}</p>
    </>
  );
};

export default BaseExample;
