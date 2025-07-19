import {Flags} from '@oclif/core'

import Command, {ipFlag} from '../../base-command'
import {DiscoveryOptions} from '../../modem/discovery'
import {toggleHostExposureEntries} from '../../modem/host-exposure'

export default class EnableHostExposureEntries extends Command {
  static description = 'Enable a set of host exposure entries'
  static examples = [
    '$ vodafone-station-cli host-exposure:enable -p PASSWORD [ENTRY NAME | [ENTRY NAME...]]',
    '$ vodafone-station-cli host-exposure:enable -p PASSWORD --ip 192.168.100.1 [ENTRY NAME | [ENTRY NAME...]]',
  ]
  static flags = {
    ip: ipFlag(),
    password: Flags.string({
      char: 'p',
      description: 'router/modem password',
    }),
  }
  static strict = false

  async run(): Promise<void> {
    const {argv, flags} = await this.parse(EnableHostExposureEntries)

    const password = flags.password ?? process.env.VODAFONE_ROUTER_PASSWORD
    if (!password || password === '') {
      this.log('You must provide a password either using -p or by setting the environment variable VODAFONE_ROUTER_PASSWORD')
      return
    }

    const discoveryOptions: DiscoveryOptions = {
      ip: flags.ip,
    }

    try {
      await toggleHostExposureEntries(true, argv as string[], password!, this.logger, discoveryOptions)
    } catch (error) {
      this.error(error as Error, {message: 'Something went wrong.'})
    }

    return
  }
}
