import {Flags} from '@oclif/core'
import Command from '../../base-command'
import {discoverModemIp, ModemDiscovery} from '../../modem/discovery'
import {modemFactory} from '../../modem/factory'
import {Log} from '../../logger'
import {HostExposureSettings} from '../../modem/modem';


export async function getHostExposureSettings(password: string, logger: Log): Promise<HostExposureSettings> {
  const modemIp = await discoverModemIp()
  const discoveredModem = await new ModemDiscovery(modemIp, logger).discover()
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
  static description =
    'Get the current IPV6 host exposure settings';

  static examples = [
    `$ vodafone-station-cli host-exposure:get -p PASSWORD
{JSON data}
`,
  ];

  static flags = {
    password: Flags.string({
      char: 'p',
      description: 'router/modem password',
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(GetHostExposure)

    const password = flags.password ?? process.env.VODAFONE_ROUTER_PASSWORD
    if (!password || password === '') {
      this.log(
        'You must provide a password either using -p or by setting the environment variable VODAFONE_ROUTER_PASSWORD'
      )
      this.exit()
    }
    try {
      const settings = await getHostExposureSettings(password!, this.logger)
      const settingsJSON = JSON.stringify(settings, undefined, 4)
      this.log(settingsJSON)
    }
    catch (error) {
      this.error(error as Error, {message: 'Something went wrong.'})
    }


    this.exit()
  }
}
