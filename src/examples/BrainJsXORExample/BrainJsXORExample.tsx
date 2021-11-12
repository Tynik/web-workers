import * as React from 'react';

import { useBrainJsTask } from '../../hooks';

const BrainJsXORExample = () => {
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
      1 | 1 = {taskResult || '?'}
    </>
  );
};

export default BrainJsXORExample;
