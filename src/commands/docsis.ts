import {Flags} from '@oclif/core'
import {promises as fsp} from 'node:fs'

import Command from '../base-command'
import {Log} from '../logger'
import {discoverModemLocation, ModemDiscovery} from '../modem/discovery'
import {modemFactory} from '../modem/factory'
import {DocsisStatus} from '../modem/modem'
import {webDiagnoseLink} from '../modem/web-diagnose'

export async function getDocsisStatus(password: string, logger: Log): Promise<DocsisStatus> {
  const modemLocation = await discoverModemLocation()
  const discoveredModem = await new ModemDiscovery(modemLocation, logger).discover()
  const modem = modemFactory(discoveredModem, logger)
  try {
    await modem.login(password)
    const docsisData = await modem.docsis()
    return docsisData
  } catch (error) {
    logger.warn('Could not fetch docsis status from modem.')
    logger.error(error as Error)
    throw error
  } finally {
    await modem.logout()
  }
}

export default class Docsis extends Command {
  static description = 'Get the current docsis status as reported by the modem in a JSON format.'
  static examples = [
    `$ vodafone-station-cli docsis -p PASSWORD
{JSON data}
`,
  ]
  static flags = {
    file: Flags.boolean({
      char: 'f',
      description: 'write out a report file under ./reports/{CURRENT_UNIX_TIMESTAMP}_docsisStatus.json',
    }),
    password: Flags.string({
      char: 'p',
      description: 'router/modem password',
    }),
    web: Flags.boolean({
      char: 'w',
      description: 'review the docsis values in a webapp',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Docsis)
    const password = flags.password ?? process.env.VODAFONE_ROUTER_PASSWORD
    if (!password || password === '') {
      this.log('You must provide a password either using -p or by setting the environment variable VODAFONE_ROUTER_PASSWORD')
      this.exit()
    }

    try {
      const docsisStatus = await getDocsisStatus(password!, this.logger)
      const docsisStatusJSON = JSON.stringify(docsisStatus, undefined, 4)

      if (flags.file) {
        await this.writeDocsisStatus(docsisStatusJSON)
      } else {
        this.log(docsisStatusJSON)
      }

      if (flags.web) {
        this.log(`Review your docsis state online -> ${webDiagnoseLink(docsisStatus)}`)
      }

      this.exit()
    } catch (error) {
      this.error(error as Error, {message: 'Something went wrong'})
    }
  }

  async writeDocsisStatus(docsisStatusJson: string): Promise<void> {
    const reportFile = `./reports/${Date.now()}_docsisStatus.json`
    this.log('Writing docsis report as json to file: ', reportFile)
    const data = new Uint8Array(Buffer.from(docsisStatusJson))
    return fsp.writeFile(reportFile, data)
  }
}
