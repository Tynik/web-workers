import * as React from 'react';

import { useTask } from '@tynik/web-workers';

const ReactSimpleGeneratorExample = () => {
  const [generatorTaskResults, setGeneratorTaskResults] = React.useState<{
    result: number,
    tookTime: number
  }[]>([]);

  const [
    simpleGeneratorTask,
    {
      isRunning: simpleGeneratorTaskIsRunning,
      isCompleted: simpleGeneratorTaskIsCompleted
    }
  ] = useTask<never, number>(
    function* () {
      yield 1;
      // fibonacci calculation for some waiting
      fibonacci(37);
      yield 2;

      fibonacci(38);
      yield 3;

      function fibonacci(num) {
        if (num <= 1) return 1;

        return fibonacci(num - 1) + fibonacci(num - 2);
      }
    });

  React.useEffect(() => {
    if (!simpleGeneratorTask) {
      return;
    }
    const gen = simpleGeneratorTask.run();

    gen.whenNext((result, meta) => {
      setGeneratorTaskResults(genTaskResults =>
        [...genTaskResults, { result, tookTime: meta.tookTime }]
      );
      // some waiting before run next generator cycle
      setTimeout(() => gen.next(), 1000);
    });

  }, [simpleGeneratorTask]);

  return (
    <>
      <p>Running: {simpleGeneratorTaskIsRunning ? 'Yes' : 'No'}</p>
      <p>Completed: {simpleGeneratorTaskIsCompleted ? 'Yes' : 'No'}</p>
      <p>Generator task result:</p>
      <pre>
        {generatorTaskResults.length ? JSON.stringify(generatorTaskResults, null, 2) : '?'}
      </pre>
    </>
  );
};

export default ReactSimpleGeneratorExample;
