import * as React from 'react';

import { Task } from '@tynik/web-workers';

const ReactPureExample = () => {
  const [pureTaskResult, setPureTaskResult] = React.useState<string>(null);

  React.useEffect(() => {
    const task = new Task<[number[]], typeof pureTaskResult>((v) => {
      return JSON.stringify(v);
    });
    (
      async () => {
        const { result } = await task.run([1, 2, 3]).whenCompleted();

        setPureTaskResult(result);
      }
    )();

    return () => {
      task.stop();
    };
  }, []);

  return (
    <>
      <p>Result: {pureTaskResult ? pureTaskResult : '?'}</p>
    </>
  );
};

export default ReactPureExample;
