import { Flags} from '@oclif/core'
import {promises as fsp} from 'fs'
import Command from '../base-command'
import {discoverModemIp, ModemDiscovery} from '../modem/discovery'
import type {DocsisStatus} from '../modem/modem'
import {modemFactory} from '../modem/factory'
import {Log } from '../logger'

export async function getDocsisStatus(password: string, logger:Log): Promise<DocsisStatus> {
  const modemIp = await discoverModemIp()
  const discoveredModem = await new ModemDiscovery(modemIp, logger).discover()
  const modem = modemFactory(discoveredModem)
  try {
    await modem.login(password)
    const docsisData = await modem.docsis()
    return docsisData
  } catch (error) {
    console.error(`Could not fetch docsis status from modem.`,error)
    throw error;
  } finally {
    await modem.logout()
  }
}

export default class Docsis extends Command {
  static description =
    'Get the current docsis status as reported by the modem in a JSON format.';

  static examples = [
    `$ vodafone-station-cli docsis -p PASSWORD
JSON data
`,
  ];

  static flags = {
    password: Flags.string({
      char: 'p',
      description: 'router/modem password',
    }),
    file: Flags.boolean({
      char: 'f',
      description: 'write out a report file',
    }),
  };

  async writeDocsisStatus(docsisStatusJson: string): Promise<void> {
    const reportFile = `./reports/${Date.now()}_docsisStatus.json`
    this.log('Writing docsis report as json to file: ', reportFile)
    const data = new Uint8Array(Buffer.from(docsisStatusJson))
    return fsp.writeFile(reportFile, data)
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Docsis)

    const password = flags.password ?? process.env.VODAFONE_ROUTER_PASSWORD
    if (!password || password === '') {
      this.log(
        'You must provide a password either using -p or by setting the environment variable VODAFONE_ROUTER_PASSWORD'
      )
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
      this.exit()
    } catch (error) {
      this.error(error as Error,{message:"Something went wrong"})
    }
  }
}
