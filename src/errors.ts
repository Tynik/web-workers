
export class NextIterationError extends Error {}

export class FuncSyntaxError extends SyntaxError {
  constructor() {
    super('The function syntax is erred');
  }
}
