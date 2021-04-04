import axios from 'axios'
import {Log} from './logger'
import {TechnicolorConfiguration} from './technicolor-modem'
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
}

export class ModemDiscovery {
  constructor(private readonly modemIp: string, private readonly logger: Log) {}

  async tryTechnicolor(): Promise<ModemInformation> {
    try {
      const {data} = await axios.get<TechnicolorConfiguration>(`http://${this.modemIp}/api/v1/login_conf`)
      this.logger.debug(`Technicolor login configuration: ${JSON.stringify(data)}`)
      if (data.error === 'ok' && data.data?.firmwareversion) {
        return {
          deviceType: 'Technicolor',
          firmwareVersion: data.data.firmwareversion,
        }
      }
      throw new Error('Could not determine modem type')
    } catch (error) {
      this.logger.warn('Could not find a router/modem under the known addresses')
      throw error
    }
  }
}
