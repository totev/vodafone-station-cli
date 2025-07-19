import {Flags} from '@oclif/core'

import Command, {ipFlag} from '../../base-command'
import {Log} from '../../logger'
import {discoverModemLocation, DiscoveryOptions, ModemDiscovery} from '../../modem/discovery'
import {modemFactory} from '../../modem/factory'
import {HostExposureSettings} from '../../modem/modem'

export async function getHostExposureSettings(password: string, logger: Log, discoveryOptions?: DiscoveryOptions): Promise<HostExposureSettings> {
  const modemLocation = await discoverModemLocation(discoveryOptions)
  const discoveredModem = await new ModemDiscovery(modemLocation, logger).discover()
  const modem = modemFactory(discoveredModem, logger)
  try {
    await modem.login(password)
    const settings = await modem.getHostExposure()
    return settings
  } catch (error) {
    console.error('Could not get host exposure settings from modem.', error)
    throw error
  } finally {
    await modem.logout()
  }
}

export default class GetHostExposure extends Command {
  static description = 'Get the current IPV6 host exposure settings';
  static examples = [
    `$ vodafone-station-cli host-exposure:get -p PASSWORD
{JSON data}
`,
    `$ vodafone-station-cli host-exposure:get -p PASSWORD --ip 192.168.100.1
{JSON data}
`,
  ];
  static flags = {
    ip: ipFlag(),
    password: Flags.string({
      char: 'p',
      description: 'router/modem password',
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(GetHostExposure)

    const password = flags.password ?? process.env.VODAFONE_ROUTER_PASSWORD
    if (!password || password === '') {
      this.log('You must provide a password either using -p or by setting the environment variable VODAFONE_ROUTER_PASSWORD')
      return
    }

    const discoveryOptions: DiscoveryOptions = {
      ip: flags.ip,
    }

    try {
      const settings = await getHostExposureSettings(password!, this.logger, discoveryOptions)
      const settingsJSON = JSON.stringify(settings, undefined, 4)
      this.log(settingsJSON)
    } catch (error) {
      this.error(error as Error, {message: 'Something went wrong.'})
    }

    return
  }
}
