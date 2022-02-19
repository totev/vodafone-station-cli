/* eslint-disable no-console */

export interface Log{
    log(message?: string, ...args: unknown[]): void;
    warn(input: string | Error | unknown): void;
    debug(...args: unknown[]): void;
    error(input: string | Error | unknown, ...options: unknown[]): void;
}

export class OclifLogger implements Log {
  // eslint-disable-next-line no-useless-constructor
  constructor(private delegateLog: Function, private delegateWarn: Function, private delegateDebug: Function, private delegateError: Function) {
  }

  error(input: string | Error, options: { code?: string | undefined; exit: false }): void {
    this.delegateError(input, options)
  }

  log(message?: string, ...args: unknown[]): void {
    this.delegateLog(message, args)
  }

  warn(input: string | Error): void {
    this.delegateWarn(input)
  }

  debug(...args: unknown[]): void {
    this.delegateDebug(args)
  }

  jsonEnabled() {
    return true;
  }
}

export class ConsoleLogger implements Log {
  error(input: string | Error, options: { code?: string | undefined; exit: false }): void {
    console.log(input, options)
  }

  debug(...args: unknown[]): void {
    console.debug(args)
  }

  warn(input: string | Error): void {
    console.warn(input)
  }

  log(message?: string, ...args: unknown[]): void {
    console.log(message, args)
  }
}
