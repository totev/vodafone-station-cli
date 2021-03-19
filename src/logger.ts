/* eslint-disable no-console */

export interface Log{
    log(message?: string, ...args: any[]): void;
    warn(input: string | Error): void;
    debug(...args: any[]): void;
    error(input: string | Error, options: {
        code?: string;
        exit: false;
    }): void;
}

export class OclifLogger implements Log {
  // eslint-disable-next-line no-useless-constructor
  constructor(private delegateLog: Function, private delegateWarn: Function, private delegateDebug: Function, private delegateError: Function) {
  }

  error(input: string | Error, options: { code?: string | undefined; exit: false }): void {
    this.delegateError(input, options)
  }

  log(message?: string, ...args: any[]): void {
    this.delegateLog(message, args)
  }

  warn(input: string | Error): void {
    this.delegateWarn(input)
  }

  debug(...args: any[]): void {
    this.delegateDebug(args)
  }
}

export class ConsoleLogger implements Log {
  error(input: string | Error, options: { code?: string | undefined; exit: false }): void {
    console.log(input, options)
  }

  debug(...args: any[]): void {
    console.debug(args)
  }

  warn(input: string | Error): void {
    console.warn(input)
  }

  log(message?: string, ...args: any[]): void{
    console.log(message, args)
  }
}
