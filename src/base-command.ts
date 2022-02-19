import {Command} from '@oclif/core'
import {config} from 'dotenv'
import {Log, OclifLogger} from './logger'
config()

export default abstract class extends Command {
  get logger(): Log {
    return new OclifLogger(this.log, this.warn, this.debug, this.error)
  }
}
