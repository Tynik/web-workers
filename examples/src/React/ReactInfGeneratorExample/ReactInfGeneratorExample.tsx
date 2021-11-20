import * as React from 'react';

import { useTask } from '@tynik/web-workers';

const ReactInfGeneratorExample = () => {
  const [generatorTaskResults, setGeneratorTaskResults] = React.useState<{
    result: number,
    tookTime: number
  }[]>([]);

  const [
    infinityGeneratorTask,
    {
      isRunning: simpleGeneratorTaskIsRunning,
      isCompleted: simpleGeneratorTaskIsCompleted
    }
  ] = useTask<never, number>(function* () {
    let i = 0;

    while (1) {
      yield i++;
    }
  });

  React.useEffect(() => {
    if (!infinityGeneratorTask) {
      return;
    }
    const gen = infinityGeneratorTask.run();
    gen.whenStarted(() => {
      // when infinity generator should be stopped
      setTimeout(gen.return, 5000);
    });

    infinityGeneratorTask.whenNext(({ result, tookTime }) => {
      setGeneratorTaskResults(genTaskResults =>
        [...genTaskResults, { result, tookTime }]
      );
      // some waiting before run next generator cycle
      setTimeout(gen.next, 1000);
    });

  }, [infinityGeneratorTask]);

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

export default ReactInfGeneratorExample;
