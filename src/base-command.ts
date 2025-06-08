import {Command} from '@oclif/core'
import {config} from 'dotenv'

import {Log, OclifLogger} from './logger'
config()

export default abstract class BaseCommand extends Command {
  get logger(): Log {
    return new OclifLogger(
      this.log.bind(this),
      this.warn.bind(this) as (input: Error | string) => Error | string,
      this.debug.bind(this),
      this.error.bind(this) as (input: Error | string, ...options: unknown[]) => void,
    )
  }
}
