import {Args, Flags} from '@oclif/core'

import Command from '../../base-command'
import {toggleHostExposureEntries} from '../../modem/host-exposure'

export default class EnableHostExposureEntries extends Command {
  static args = {
    entries: Args.string({
      description: 'Host exposure entries to enable. Pass no names to enable every existing entry.',
      required: false,
    }),
  }
  static description = 'Enable a set of host exposure entries'
  static examples = ['$ vodafone-station-cli host-exposure:enable -p PASSWORD [ENTRY NAME | [ENTRY NAME...]]']
  static flags = {
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
      this.exit()
    }

    try {
      await toggleHostExposureEntries(true, argv as string[], password!, this.logger)
    } catch (error) {
      this.error(error as Error, {message: 'Something went wrong.'})
    }

    this.exit()
  }
}
