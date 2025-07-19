import {Log} from '../logger'
import {discoverModemLocation, DiscoveryOptions, ModemDiscovery} from './discovery'
import {colorize} from './docsis-diagnose'
import {modemFactory} from './factory'

export async function toggleHostExposureEntries(toggle: boolean, entries: string[], password: string, logger: Log, discoveryOptions?: DiscoveryOptions): Promise<void> {
  const modemLocation = await discoverModemLocation(discoveryOptions)
  const discoveredModem = await new ModemDiscovery(modemLocation, logger).discover()
  const modem = modemFactory(discoveredModem, logger)
  try {
    await modem.login(password)
    const settings = await modem.getHostExposure()

    let names = entries
    if (names.length === 0) {
      names = settings.hosts.map(host => host.serviceName)
    }

    for (const name of names) {
      const index = settings.hosts.findIndex(host => host.serviceName === name)
      if (index === -1) {
        logger.log(colorize('yellow', `Entry with the name '${name}' does not exist.`))
      } else {
        settings.hosts[index].enabled = toggle
      }
    }

    await modem.setHostExposure(settings)
  } catch (error) {
    logger.error('Could not change host exposure settings on modem.', error)
    throw error
  } finally {
    await modem.logout()
  }
}
