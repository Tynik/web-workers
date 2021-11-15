import * as React from 'react';

import { useBrainJsTask } from '@tynik/web-workers';

const ReactBrainJsXORExample = () => {
  const [taskResult, setTaskResult] = React.useState<number>(null);

  const [task] = useBrainJsTask<[[number, number]], [number]>(function(this, brain, input) {
    const net = new brain.NeuralNetwork<typeof input, [number]>();

    net.train([
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] }
    ]);
    return net.run(input);
  });

  React.useEffect(() => {
    if (!task) {
      return;
    }
    task.run([1, 1]).whenCompleted(result => {
      setTaskResult(result[0]);
    });
  }, [task]);

  return (
    <>
      <p>Assumed XOR value:</p>
      <p>1 | 1 = {taskResult ? (taskResult * 100).toFixed(2) : '?'}%</p>
    </>
  );
};

export default ReactBrainJsXORExample;
