import {Flags} from '@oclif/core';

import Command, {ipFlag} from '../base-command';
import {DiscoveryOptions} from '../modem/discovery';
import DocsisDiagnose, {colorize} from '../modem/docsis-diagnose';
import {TablePrinter} from '../modem/printer';
import {webDiagnoseLink} from '../modem/web-diagnose';
import {getDocsisStatus} from './docsis';

export default class Diagnose extends Command {
  static description
    = 'Diagnose the quality of the docsis connection.';
  static examples = [
    '$ vodafone-station-cli diagnose',
    '$ vodafone-station-cli diagnose --ip 192.168.100.1',
  ];
  static flags = {
    ip: ipFlag(),
    password: Flags.string({
      char: 'p',
      description: 'router/modem password',
    }),
    web: Flags.boolean({
      char: 'w',
      description: 'review the docsis values in a webapp',
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(Diagnose)

    const password = flags.password ?? process.env.VODAFONE_ROUTER_PASSWORD
    if (!password || password === '') {
      this.log('You must provide a password either using -p or by setting the environment variable VODAFONE_ROUTER_PASSWORD')
      return
    }

    const discoveryOptions: DiscoveryOptions = {
      ip: flags.ip,
    }

    try {
      const docsisStatus = await getDocsisStatus(password!, this.logger, discoveryOptions)
      const diagnoser = new DocsisDiagnose(docsisStatus)
      const tablePrinter = new TablePrinter(docsisStatus);
      this.log(tablePrinter.print())

      if (diagnoser.hasDeviations()) {
        this.log(colorize('yellow', 'Warning: Docsis connection quality deviation found!'));
      }

      if (flags.web) {
        this.log(`Review your docsis state online -> ${webDiagnoseLink(docsisStatus)}`)
      }

      this.log(diagnoser.printDeviationsConsole())
    } catch (error) {
      this.error(error as Error, {message: 'Something went wrong'})
    }
  }
}

