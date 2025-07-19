import {Args, Flags} from '@oclif/core'
import {readFile} from 'node:fs/promises'

import Command, {ipFlag} from '../../base-command'
import {Log} from '../../logger'
import {discoverModemLocation, DiscoveryOptions, ModemDiscovery} from '../../modem/discovery'
import {modemFactory} from '../../modem/factory'
import {HostExposureSettings} from '../../modem/modem'

export async function setHostExposureSettings(
  settings: HostExposureSettings,
  password: string,
  logger: Log,
  discoveryOptions?: DiscoveryOptions,
): Promise<HostExposureSettings> {
  const modemLocation = await discoverModemLocation(discoveryOptions)
  const discoveredModem = await new ModemDiscovery(modemLocation, logger).discover()
  const modem = modemFactory(discoveredModem, logger)
  try {
    await modem.login(password)
    await modem.setHostExposure(settings)
    return settings
  } catch (error) {
    logger.error('Could not get host exposure settings from modem.', error)
    throw error
  } finally {
    await modem.logout()
  }
}

export default class SetHostExposure extends Command {
  static args = {
    file: Args.string({
      description: 'input JSON file',
      required: true,
    }),
  }
  static description = 'Set the current IPV6 host exposure settings from a JSON file'
  static examples = [
    '$ vodafone-station-cli host-exposure:set -p PASSWORD <FILE>',
    '$ vodafone-station-cli host-exposure:set -p PASSWORD --ip 192.168.100.1 <FILE>',
  ]
  static flags = {
    ip: ipFlag(),
    password: Flags.string({
      char: 'p',
      description: 'router/modem password',
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(SetHostExposure)

    const password = flags.password ?? process.env.VODAFONE_ROUTER_PASSWORD
    if (!password || password === '') {
      this.log('You must provide a password either using -p or by setting the environment variable VODAFONE_ROUTER_PASSWORD')
      return
    }

    const discoveryOptions: DiscoveryOptions = {
      ip: flags.ip,
    }

    try {
      const newSettingsJSON = await readFile(args.file, {encoding: 'utf8'})
      const newSettings = JSON.parse(newSettingsJSON) as HostExposureSettings
      await setHostExposureSettings(newSettings, password!, this.logger, discoveryOptions)
      this.log('New host exposure settings set.')
    } catch (error) {
      this.error(error as Error, {message: 'Something went wrong.'})
    }
  }
}
