import * as React from 'react';

import { Task } from '@tynik/web-workers';

const ReactPureExample = () => {
  const [pureTaskResult, setPureTaskResult] = React.useState<string>(null);

  React.useEffect(() => {
    const task = new Task<[number[]], typeof pureTaskResult>((v) => {
      return JSON.stringify(v);
    });
    task.run([1, 2, 3])
      .whenCompleted(({ result }) => setPureTaskResult(result));

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
