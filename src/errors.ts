
export class NextIterationError extends Error {}

export class FuncSyntaxError extends SyntaxError {
  constructor() {
    super('The function syntax is erred');
  }
}

export class GenFuncSyntaxError extends SyntaxError {
  constructor() {
    super('The generator function syntax is erred');
  }
}
