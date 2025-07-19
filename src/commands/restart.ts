import {Flags} from '@oclif/core';

import Command, {ipFlag} from '../base-command';
import {discoverModemLocation, DiscoveryOptions, ModemDiscovery} from '../modem/discovery';
import {modemFactory} from '../modem/factory';

export default class Restart extends Command {
  static description = 'restart the modem/router';
  static examples = [
    '$ vodafone-station-cli restart',
    '$ vodafone-station-cli restart --ip 192.168.100.1',
  ];
  static flags = {
    ip: ipFlag(),
    password: Flags.string({
      char: 'p',
      description: 'router/modem password',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Restart)
    const password = flags.password ?? process.env.VODAFONE_ROUTER_PASSWORD
    if (!password || password === '') {
      this.log('You must provide a password either using -p or by setting the environment variable VODAFONE_ROUTER_PASSWORD')
      return
    }

    const discoveryOptions: DiscoveryOptions = {
      ip: flags.ip,
    }

    const modemLocation = await discoverModemLocation(discoveryOptions)
    const discoveredModem = await new ModemDiscovery(modemLocation, this.logger).discover()
    const modem = modemFactory(discoveredModem, this.logger)
    try {
      await modem.login(password!)
      await modem.restart()
      this.log('The modem has been restarted.')
    } catch (error) {
      this.log('Something went wrong.', error)
    } finally {
      await modem.logout()
    }
  }
}
