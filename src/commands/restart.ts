import {Flags} from '@oclif/core'
import Command from '../base-command'
import {discoverModemIp, ModemDiscovery} from '../modem/discovery'
import {modemFactory} from '../modem/factory'

export default class Restart extends Command {
  static description =
    'Restart the router/modem';

  static examples = [
    '$ vodafone-station-cli restart -p PASSWORD',
  ];

  static flags = {
    password: Flags.string({
      char: 'p',
      description: 'router/modem password',
    }),
  };

  async restartRouter(password: string): Promise<unknown> {
    const modemIp = await discoverModemIp()
    const discoveredModem = await new ModemDiscovery(modemIp, this.logger).discover()
    const modem = modemFactory(discoveredModem, this.logger)
    try {
      await modem.login(password)
      const restart = await modem.restart()
      return restart
    } catch (error) {
      this.log('Something went wrong.', error)
    } finally {
      await modem.logout()
    }
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Restart)

    const password = flags.password ?? process.env.VODAFONE_ROUTER_PASSWORD
    if (!password || password === '') {
      this.log(
        'You must provide a password either using -p or by setting the environment variable VODAFONE_ROUTER_PASSWORD'
      )
      this.exit()
    }
    this.log('Restarting router... this could take some time...')
    await this.restartRouter(password!)
    this.exit()
  }
}
