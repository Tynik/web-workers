# Web Workers (beta)

*My inspiration how we can use React, Web Workers, and AI frontend technologies*

**Notes**
1. IE browser is not supported

**Features**
1. Smooth UI when computing something heavy.
2. Predefined React hooks to create a background task.
3. Event-based replies from a task function.
4. Possibility to use promise-based task functions.

**Limitations inside task function**
1. You can not use the outer scope.
2. You can not use DOM manipulations.

All examples directory [here](src/examples).

**Examples**
1. [Base](/examples/src/BaseExample/BaseExample.tsx)
2. [Promise-based result](/examples/src/PromiseResultExample/PromiseResultExample.tsx)
2. [Brain.js XOR](/examples/src/BrainJsXORExample/BrainJsXORExample.tsx)
3. [Files processing](/examples/src/FilesProcessingExample/FilesProcessingExample.tsx)
