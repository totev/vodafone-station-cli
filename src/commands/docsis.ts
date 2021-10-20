import {flags} from '@oclif/command'
import {promises as fsp} from 'fs'
import Command from '../base-command'
import {discoverModemIp, ModemDiscovery} from '../modem/discovery'
import type {DocsisStatus} from '../modem/modem'
import {modemFactory} from '../modem/factory'

export default class Docsis extends Command {
  static description =
    'Get the current docsis status as reported by the modem in a JSON format.';

  static examples = [
    `$ vodafone-station-cli docsis -p PASSWORD
JSON data
`,
  ];

  static flags = {
    password: flags.string({
      char: 'p',
      description: 'router/modem password',
    }),
    file: flags.boolean({
      char: 'f',
      description: 'write out a report file',
    }),
  };

  async getDocsisStatus(password: string): Promise<DocsisStatus> {
    const modemIp = await discoverModemIp()
    const discoveredModem = await new ModemDiscovery(modemIp, this.logger).discover()
    const modem = modemFactory(discoveredModem)
    try {
      await modem.login(password)
      const docsisData = await modem.docsis()
      return docsisData
    } catch (error) {
      this.error('Something went wrong.', error as Error)
      throw new Error('Could not fetch docsis status from modem')
    } finally {
      await modem.logout()
    }
  }

  async writeDocsisStatus(docsisStatusJson: string): Promise<void> {
    const reportFile = `./reports/${Date.now()}_docsisStatus.json`
    this.log('Writing docsis report as json to file: ', reportFile)
    const data = new Uint8Array(Buffer.from(docsisStatusJson))
    return fsp.writeFile(reportFile, data)
  }

  async run(): Promise<void> {
    const {flags} = this.parse(Docsis)

    const password = flags.password ?? process.env.VODAFONE_ROUTER_PASSWORD
    if (!password || password === '') {
      this.log(
        'You must provide a password either using -p or by setting the environment variable VODAFONE_ROUTER_PASSWORD'
      )
      this.exit()
    }

    const docsisStatus = await this.getDocsisStatus(password)
    const docsisStatusJSON = JSON.stringify(docsisStatus, undefined, 4)

    if (flags.file) {
      await this.writeDocsisStatus(docsisStatusJSON)
    } else {
      this.log(docsisStatusJSON)
    }
    this.exit()
  }
}
