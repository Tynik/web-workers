import * as React from 'react';

import { useTask } from '@tynik/web-workers';

const ReactTasksQueueExample = () => {
  const [fibonacciNumbersResults, setFibonacciNumbersResults] = React.useState<{
    number: number
    fibonacci: number
    tookTime: number
  }[]>([]);

  const [
    task,
    { queueLength, isRunning }

  ] = useTask<[number], number>(
    (number) => {
      return (
        function fibonacci(num) {
          if (num <= 1) return 1;

          return fibonacci(num - 1) + fibonacci(num - 2);
        }
      )(number);
    });

  React.useEffect(() => {
    if (!task) {
      return;
    }
    const numbers = [37, 38, 39, 40, 41];

    numbers.forEach(async (number) => {
      const { result: fibonacci, tookTime } = await task.run(number).whenCompleted;

      setFibonacciNumbersResults(loadTaskResults => (
        [
          ...loadTaskResults,
          {
            number,
            fibonacci,
            tookTime
          }
        ]
      ));
    });
  }, [task]);

  return (
    <>
      <p>Tasks queue length: {queueLength}</p>
      <p>Is running: {isRunning ? 'Yes' : 'No'}</p>

      <p>Task results of Fibonacci numbers:</p>
      <pre>{JSON.stringify(fibonacciNumbersResults, null, 2)}</pre>
    </>
  );
};

export default ReactTasksQueueExample;
