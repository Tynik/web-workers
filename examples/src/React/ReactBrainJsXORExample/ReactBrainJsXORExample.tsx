import * as React from 'react';

import { RunTaskAPI, useBrainJsTask } from '@tynik/web-workers';

type Input = [number, number];
type Return = [number];

const ReactBrainJsXORExample = () => {
  const [taskResults, setTaskResults] = React.useState<Record<string, number>>(null);

  const [task] = useBrainJsTask<[Input], Return>(function* (this, brain, input) {
    const net = new brain.NeuralNetwork<Input, Return>();

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

  const setTaskResult = (input: Input, result: Return): void => {
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
    const inputs: Input[] = [[0, 0], [0, 1], [1, 0], [1, 1]];

    let taskInstance: RunTaskAPI<[Input], Return>;

    inputs.forEach((input, index) => {
      if (index) {
        taskInstance.next(input).then(({ result }) =>
          setTaskResult(input, result)
        );
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
