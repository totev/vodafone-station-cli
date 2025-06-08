import Command from '../base-command'
import {discoverModemIp, ModemDiscovery} from '../modem/discovery'

export default class Discover extends Command {
  static description
    = 'Try to discover a cable modem in the network';
  static examples = [
    '$ vodafone-station-cli discover',
  ];

  async discoverModem(): Promise<void> {
    try {
      const modemIp = await discoverModemIp()
      this.log(`Possibly found modem under the following IP: ${modemIp}`)
      const modem = new ModemDiscovery(modemIp, this.logger)
      const discoveredModem = await modem.discover()
      this.log(`Discovered modem: ${JSON.stringify(discoveredModem)}`)
    } catch (error) {
      this.log('Something went wrong.', error)
    }
  }

  async run(): Promise<void> {
    await this.discoverModem()
    this.exit()
  }
}
