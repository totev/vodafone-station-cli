import Command from '../base-command'
import {discoverModemIp, ModemDiscovery} from '../modem/discovery'
import {flags} from '@oclif/command'
import { modemFactory } from "../modem/factory";
import {getDocsisStatus} from "./docsis";
import DocsisDiagnose from "../modem/docsis-diagnose";

export default class Diagnose extends Command {
  static description =
    'Diagnose the state and quality of the docsis connection.';

  static examples = [
    '$ vodafone-station-cli diagnose',
  ];

  static flags = {
    password: flags.string({
      char: 'p',
      description: 'router/modem password',
    }),
  };


  async run(): Promise<void> {
    const {flags} = this.parse(Diagnose)

    const password = flags.password ?? process.env.VODAFONE_ROUTER_PASSWORD
    if (!password || password === '') {
      this.log(
        'You must provide a password either using -p or by setting the environment variable VODAFONE_ROUTER_PASSWORD'
      )
      this.exit()
    }

    try {

      const docsisStatus = await getDocsisStatus(password, this.logger)
      const diagnoser = new DocsisDiagnose(docsisStatus)

      if (diagnoser.detectDeviations()) {
        this.logger.warn("Docsis connection connection quality deviation found!")
      }
      
      const diagnosedDocsisStatusJSON = JSON.stringify(diagnoser, undefined, 4)

      this.log(diagnosedDocsisStatusJSON)

    } catch (error) {
      this.error(error as Error,{message:"Something went wrong"})
    }
  }
}

