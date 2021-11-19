import * as React from 'react';

import { useBrainJsTask } from '@tynik/web-workers';

const ReactBrainJsXORExample = () => {
  const [taskResults, setTaskResults] = React.useState<Record<string, number>>(null);

  const [task] = useBrainJsTask<[[number, number]], [number]>(function* (this, brain, input) {
    const net = new brain.NeuralNetwork<[number, number], [number]>();

    net.train([
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] }
    ]);
    while (1) {
      input = yield net.run(input);
    }
  });

  const setTaskResult = (input: [number, number], result: [number]): void => {
    setTaskResults((taskResults) => (
      {
        ...taskResults,
        [JSON.stringify(input)]: result[0]
      }
    ));
  };

  React.useEffect(() => {
    if (!task) {
      return;
    }
    const inputs: [number, number][] = [[0, 0], [0, 1], [1, 0], [1, 1]];

    let taskInstance;
    inputs.forEach((input, index) => {
      if (index) {
        taskInstance.next(input).then(({ result }) => setTaskResult(input, result));
      } else {
        taskInstance = task.run(input);
        task.whenNext(({ result }) => setTaskResult(input, result), true);
      }
    });
  }, [task]);

  return (
    <>
      <p>Assumed XOR values:</p>
      <pre>{taskResults && JSON.stringify(taskResults, null, 2)}</pre>
    </>
  );
};

export default ReactBrainJsXORExample;
