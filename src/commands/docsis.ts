import {flags} from '@oclif/command'
import {promises as fsp} from 'fs'
import Command from '../base-command'
import {CliClient} from '../client'
import {discoverModemIp} from '../discovery'
import {DocsisStatus} from '../html-parser'
import {OclifLogger} from '../logger'

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
    const cliClient = new CliClient(await discoverModemIp(), new OclifLogger(this.log, this.warn, this.debug, this.error))
    try {
      const csrfNonce = await cliClient.login(password)
      return cliClient.fetchDocsisStatus(csrfNonce)
    } catch (error) {
      this.error('Something went wrong.', error)
      throw new Error('Could not fetch docsis status from modem')
    } finally {
      await cliClient.logout()
    }
  }

  async writeDocsisStatus(docsisStatusJson: string): Promise<void> {
    const reportFile = `reports/${Date.now()}_docsisStatus.json`
    this.log('Writing docsis report as json to file: ', reportFile)
    const data = new Uint8Array(Buffer.from(docsisStatusJson))
    return fsp.writeFile(reportFile, data)
  }

  async run(): Promise<void> {
    const {flags} = this.parse(Docsis)

    const password = process.env.VODAFONE_ROUTER_PASSWORD ?? flags.password
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
