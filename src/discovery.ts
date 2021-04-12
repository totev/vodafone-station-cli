import axios from 'axios'
import {extractFirmwareVersion} from './html-parser'
import {Log} from './logger'
import {TechnicolorConfiguration} from './modem/technicolor-modem'
const BRIDGED_MODEM_IP = '192.168.100.1'
const ROUTER_IP = '192.168.0.1'

export async function discoverModemIp(): Promise<string> {
  try {
    const result = await Promise.any([axios.head(`http://${BRIDGED_MODEM_IP}`), axios.head(`http://${ROUTER_IP}`)])
    const hostIp = result.request?.host
    return hostIp
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Could not find a router/modem under the known addresses', error)
    throw error
  }
}

export interface ModemInformation{
  deviceType: 'Arris' | 'Technicolor';
  firmwareVersion: string;
  ipAddress: string;
}

export class ModemDiscovery {
  constructor(private readonly modemIp: string, private readonly logger: Log) {}

  async tryTechnicolor(): Promise<ModemInformation> {
    const {data} = await axios.get<TechnicolorConfiguration>(`http://${this.modemIp}/api/v1/login_conf`)
    this.logger.debug(`Technicolor login configuration: ${JSON.stringify(data)}`)
    if (data.error === 'ok' && data.data?.firmwareversion) {
      return {
        deviceType: 'Technicolor',
        firmwareVersion: data.data.firmwareversion,
        ipAddress: this.modemIp,
      }
    }
    throw new Error('Could not determine modem type')
  }

  async tryArris(): Promise<ModemInformation> {
    const {data} = await axios.get(`http://${this.modemIp}/index.php`, {
      headers: {Accept: 'text/html,application/xhtml+xml,application/xml',
      },
    })
    const firmwareVersion = extractFirmwareVersion(data)
    if (!firmwareVersion) {
      throw new Error('Unable to parse firmware version.')
    }
    return {
      deviceType: 'Arris',
      firmwareVersion,
      ipAddress: this.modemIp,
    }
  }

  async discover(): Promise<ModemInformation> {
    try {
      const discovery = await Promise.allSettled([this.tryArris(), this.tryTechnicolor()])
      const maybeModem = discovery.find(fam => fam.status === 'fulfilled') as PromiseFulfilledResult<ModemInformation> | undefined
      if (!maybeModem) {
        throw new Error('Modem discovery was unsuccessful')
      }
      return maybeModem.value
    } catch (error) {
      this.logger.warn('Could not find a router/modem under the known addresses')
      throw error
    }
  }
}
