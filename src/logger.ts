
export interface Log {
  debug(...args: unknown[]): void;
  error(input: Error | string, ...options: unknown[]): void;
  log(message?: string, ...args: unknown[]): void;
  warn(input: Error | string): void;
}

export class OclifLogger implements Log {
  constructor(
    private delegateLog: (message?: string, ...args: unknown[]) => void,
    private delegateWarn: (input: Error | string) => Error | string,
    private delegateDebug: (...args: unknown[]) => void,
    private delegateError: (input: Error | string, ...options: unknown[]) => void,
  ) {}

  debug(...args: unknown[]): void {
    this.delegateDebug(args)
  }

  error(input: Error | string, options: {code?: string | undefined; exit: false}): void {
    this.delegateError(input, options)
  }

  jsonEnabled() {
    return true;
  }

  log(message?: string, ...args: unknown[]): void {
    this.delegateLog(message, args)
  }

  warn(input: Error | string): void {
    this.delegateWarn(input)
  }
}

export class ConsoleLogger implements Log {
  debug(...args: unknown[]): void {
    console.debug(args)
  }

  error(input: Error | string, options: {code?: string | undefined; exit: false}): void {
    console.log(input, options)
  }

  log(message?: string, ...args: unknown[]): void {
    console.log(message, args)
  }

  warn(input: Error | string): void {
    console.warn(input)
  }
}
