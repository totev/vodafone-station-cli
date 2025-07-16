import Command, {ipFlag} from '../base-command';
import {discoverModemLocation, DiscoveryOptions, ModemDiscovery} from '../modem/discovery';

export default class Discover extends Command {
  static description
    = 'Try to discover a cable modem in the network';
  static examples = [
    '$ vodafone-station-cli discover',
    '$ vodafone-station-cli discover --ip 192.168.100.1',
  ];
  static flags = {
    ip: ipFlag(),
  }

  async discoverModem(): Promise<void> {
    try {
      const {flags} = await this.parse(Discover)
      const discoveryOptions: DiscoveryOptions = {
        ip: flags.ip,
      }

      const modemLocation = await discoverModemLocation(discoveryOptions);
      this.log(`Possibly found modem under the following location: ${modemLocation.protocol}://${modemLocation.ipAddress}`);
      const modem = new ModemDiscovery(modemLocation, this.logger);
      const discoveredModem = await modem.discover();
      this.log(`Discovered modem: ${JSON.stringify(discoveredModem)}`);
    } catch (error) {
      this.log('Something went wrong.', error);
    }
  }

  async run(): Promise<void> {
    await this.discoverModem();
    this.exit();
  }
}
