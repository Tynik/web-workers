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
2. [Base](/examples/src/React/ReactBaseExample/ReactBaseExample.tsx).
3. [Tasks queue](/examples/src/React/ReactTasksQueueExample/ReactTasksQueueExample.tsx). Calling the heavy task with different arguments at the same time.
4. [Promise-based result](/examples/src/React/ReactPromiseResultExample/ReactPromiseResultExample.tsx).
5. [Brain.js XOR](/examples/src/React/ReactBrainJsXORExample/ReactBrainJsXORExample.tsx).
6. [Files processing](/examples/src/React/ReactFilesProcessingExample/ReactFilesProcessingExample.tsx).
7. [Simple generator](/examples/src/React/ReactSimpleGeneratorExample/ReactSimpleGeneratorExample.tsx).
