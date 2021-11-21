# Web Workers (beta)

[![Latest version](https://img.shields.io/npm/v/@tynik/web-workers)](https://www.npmjs.com/package/@tynik/web-workers)
[![Publish status](https://github.com/Tynik/web-workers/actions/workflows/publish.yml/badge.svg)](https://github.com/Tynik/web-workers/actions/workflows/publish.yml)
[![Package size](https://img.shields.io/bundlephobia/minzip/@tynik/web-workers)](https://www.npmjs.com/package/@tynik/web-workers)
[![Downloads statistic](https://img.shields.io/npm/dm/@tynik/web-workers)](https://www.npmjs.com/package/@tynik/web-workers)
[![Commit activity](https://img.shields.io/github/commit-activity/m/tynik/web-workers)](https://www.npmjs.com/package/@tynik/web-workers)
[![Licence](https://img.shields.io/npm/l/@tynik/web-workers)](https://www.npmjs.com/package/@tynik/web-workers)

*My inspiration how we can use React, Web Workers, and AI frontend technologies*

## Features

1. Smooth UI when computing something heavy.
2. Predefined React hooks to create a background task.
3. Event-based replies from a task function.
4. Possibility to use promise-based and generator task functions.

## Limitations inside task function

1. You cannot use the outer scope because task function is isolated and is run in another thread, but you can pass arguments to task function.
2. You cannot use DOM manipulations.
3. You cannot use recursion inside passed function as argument for a task function. All passed functions become anonymous functions (do not have a name) that's why a function cannot call itself. You can declare a recursive function inside task function or import it via dependencies.

## Installation

1. Install npm package

    ```bash
    npm i @tynik/web-workers
    ```

2. File `worker.worker.js` is required by a worker and is fetched when the worker is initiated. You should copy `worker.worker.js` file from `@tynik/web-workers` package before you will start your own project. If you use Webpack you can install [copy-webpack-plugin](https://webpack.js.org/plugins/copy-webpack-plugin/) package and will add the next configuration to Webpack config file.

    ```typescript
    // webpack.config.js
    
    const CopyWebpackPlugin = require('copy-webpack-plugin');
    
    module.exports = {
      // webpack settings...
      plugins: [
        new CopyWebpackPlugin({
          patterns: [
            'node_modules/@tynik/web-workers/dist/worker.worker.js'
          ]
        })
      ]
    }
    ```

## Examples

All examples directory [here](examples/src).

**React**

1. [Pure](/examples/src/React/ReactPureExample/ReactPureExample.tsx). Implemented with using base `Task` class. 
1. [Base](/examples/src/React/ReactBaseExample/ReactBaseExample.tsx).
1. [Tasks queue](/examples/src/React/ReactTasksQueueExample/ReactTasksQueueExample.tsx). Calling the heavy task with different arguments at the same time.
1. [Promise-based result](/examples/src/React/ReactPromiseResultExample/ReactPromiseResultExample.tsx).
1. [Simple generator](/examples/src/React/ReactSimpleGeneratorExample/ReactSimpleGeneratorExample.tsx).
1. [Infinity generator](/examples/src/React/ReactInfGeneratorExample/ReactInfGeneratorExample.tsx). Task function as infinity generator that automatically stopped after some time.
1. [Files processing](/examples/src/React/ReactFilesProcessingExample/ReactFilesProcessingExample.tsx).
1. [Brain.js XOR](/examples/src/React/ReactBrainJsXORExample/ReactBrainJsXORExample.tsx).

## Notes

1. High resolution time metrics. Please, see [reduced time precision in Firefox](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now#reduced_time_precision).

## API

**Task** class

1. `constructor(func: TaskFunction, { deps?: string[] })` - Initiating a task with creating a new Worker. Transferred function currently is not run.
1. `run(...args: Params): RunTaskAPI` - Transfer and run a function inside created Worker.
1. `stop(): void` - Stop the Worker. Function executing also is terminated.

**RunTaskAPI**

The `RunTaskAPI` interface it is the result of executing `run()` method.

1. `whenSent(): Promise<Meta>` - Subscribe on `sent` event.
1. `whenStarted(): Promise<Meta>` - Subscribe on `started` event.
1. `whenCompleted(): Promise<{ result: Result } & Meta>` - Subscribe on `completed` event.
1. `whenError(): Promise<{ result: string } & Meta>` - Subscribe on `error` event.
1. `next(...args: Params): Promise<{ result: Result } & Meta>` - Run the next iteration for a task generator function with transferring arguments.
1. `return(value?: any): void` - Stop a task generator function with passing `value` as a result if needed. In common can be used to stop infinity generators.
1. `throw(e?: any): void` - Throw an error inside a task generator function. The argument `e` can accept only cloneable objects. To more know about that you can read [The structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).
