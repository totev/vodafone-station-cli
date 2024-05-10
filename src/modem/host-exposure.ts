import {discoverModemIp, ModemDiscovery} from './discovery'
import {modemFactory} from './factory'
import {Log} from '../logger'

export async function toggleHostExposureEntries(toggle: boolean, entries: string[], password: string, logger: Log): Promise<void> {
  const modemIp = await discoverModemIp()
  const discoveredModem = await new ModemDiscovery(modemIp, logger).discover()
  const modem = modemFactory(discoveredModem, logger)
  try {
    await modem.login(password)
    let settings = await modem.getHostExposure()

    let names = entries
    if (names.length === 0) {
      names = settings.hosts.map((host) => host.serviceName)
    }

    for (const name of names) {
      const index = settings.hosts.findIndex((host) => host.serviceName === name)
      if (index === -1) {
        logger.warn(`Entry with the name '${name}' does not exist.`)
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
