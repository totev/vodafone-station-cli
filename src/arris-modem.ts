import {Log} from './logger'
import {Modem} from './modem'

export class Arris extends Modem {
  constructor(readonly modemIp: string, readonly logger: Log) {
    super(modemIp, logger)
  }

  async logout(): Promise<void> {
    try {
      this.logger.log('Logging out...')
      return  this.httpClient.post('/php/logout.php')
    } catch (error) {
      this.logger.error('Could not do a full session logout', error)
      throw error
    }
  }
}
