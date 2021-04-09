import {Log} from './logger'
import {Modem} from './modem'

export class Arris extends Modem {
  constructor(readonly modemIp: string, readonly logger: Log) {
    super(modemIp, logger)
  }

  async logout(): Promise<void> {
    throw new Error('Not implemented!')
  }
}
