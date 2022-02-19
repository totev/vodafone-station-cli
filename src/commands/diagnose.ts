import { Flags } from '@oclif/core';
import Command from '../base-command';
import DocsisDiagnose from "../modem/docsis-diagnose";
import { getDocsisStatus } from "./docsis";

export default class Diagnose extends Command {
  static description =
    'Diagnose the quality of the docsis connection.';

  static examples = [
    '$ vodafone-station-cli diagnose',
  ];

  static flags = {
    password: Flags.string({
      char: 'p',
      description: 'router/modem password',
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(Diagnose)

    const password = flags.password ?? process.env.VODAFONE_ROUTER_PASSWORD
    if (!password || password === '') {
      this.log(
        'You must provide a password either using -p or by setting the environment variable VODAFONE_ROUTER_PASSWORD'
      )
      this.exit()
    }

    try {
      const docsisStatus = await getDocsisStatus(password!, this.logger)
      const diagnoser = new DocsisDiagnose(docsisStatus)

      if (diagnoser.hasDeviations()) {
        this.logger.warn("Docsis connection connection quality deviation found!")
        const diagnosedDocsisStatusJSON = JSON.stringify(diagnoser.diagnose, undefined, 4)
        this.log(diagnosedDocsisStatusJSON)
      }

      this.log(diagnoser.printDeviationsConsole())
    } catch (error) {
      this.error(error as Error,{message:"Something went wrong"})
    }
  }
}

