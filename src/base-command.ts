import { Command, Flags } from '@oclif/core'
import { config } from 'dotenv'

import { Log, OclifLogger } from './logger'
config()

export const ipFlag = () => Flags.string({
  char: 'i',
  description: 'IP address of the modem/router (default: try 192.168.100.1 and 192.168.0.1)',
  env: 'VODAFONE_ROUTER_IP',
})

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
