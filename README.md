# Web Workers (beta)

*My inspiration how we can use React, Web Workers, and AI frontend technologies*

**Notes**
1. IE browser is not supported

**Features**
1. Smooth UI when computing something heavy.
2. Predefined React hooks to create a background task.
3. Event-based replies from a task function.
4. Possibility to use promise-based task functions.

**Limitations**
1. You can not use the outer scope inside task function.
2. You can not use DOM manipulations.

All examples directory [here](src/examples).

**Examples**
1. [Base](src/examples/BaseExample/BaseExample.tsx)
2. [Promise-based result](src/examples/PromiseResultExample/PromiseResultExample.tsx)
2. [Brain.js XOR](src/examples/BrainJsXORExample/BrainJsXORExample.tsx)
3. [Files processing](src/examples/FilesProcessingExample/FilesProcessingExample.tsx)
