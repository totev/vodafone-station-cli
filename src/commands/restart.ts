import {flags} from '@oclif/command'
import Command from '../base-command'
import {CliClient} from '../client'
import {discoverModemIp} from '../discovery'

export default class Restart extends Command {
  static description =
    'Restart the router/modem';

  static examples = [
    '$ vodafone-station-cli restart -p PASSWORD',
  ];

  static flags = {
    password: flags.string({
      char: 'p',
      description: 'router/modem password',
    }),
  };

  async restartRouter(password: string) {
    const cliClient = new CliClient(await discoverModemIp())
    try {
      const csrfNonce = await cliClient.login(password)
      await cliClient.restart(csrfNonce)
    } catch (error) {
      this.log('Something went wrong.', error)
    } finally {
      await cliClient.logout()
    }
  }

  async run() {
    const {flags} = this.parse(Restart)

    const password = process.env.VODAFONE_ROUTER_PASSWORD ?? flags.password
    if (!password || password === '') {
      this.log(
        'You must provide a password either using -p or by setting the environment variable VODAFONE_ROUTER_PASSWORD'
      )
      this.exit()
    }
    this.log('Restarting router...')
    await this.restartRouter(password)
    this.exit()
  }
}
