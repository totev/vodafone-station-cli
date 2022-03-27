import axios, { AxiosResponse } from 'axios'
import { Log } from '../logger'
import { TechnicolorConfiguration } from './technicolor-modem'
import { extractFirmwareVersion } from './tools/html-parser'
const BRIDGED_MODEM_IP = '192.168.100.1'
const ROUTER_IP = '192.168.0.1'
axios.defaults.timeout = 10000

export async function discoverModemIp(): Promise<string> {
  try {
    const results = await Promise.allSettled([axios.head(`http://${BRIDGED_MODEM_IP}`), axios.head(`http://${ROUTER_IP}`)])
    const maybeResult = results.find(result => result.status === "fulfilled") as { value: AxiosResponse }
      | undefined;
    if (maybeResult?.value.request?.host) {
      return maybeResult?.value.request?.host;
    }
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Could not find a router/modem under the known addresses.')
    throw error
  }
}

export interface ModemInformation {
  deviceType: 'Arris' | 'Technicolor';
  firmwareVersion: string;
  ipAddress: string;
}

export class ModemDiscovery {
  constructor(private readonly modemIp: string, private readonly logger: Log) { }

  async tryTechnicolor(): Promise<ModemInformation> {
    const { data } = await axios.get<TechnicolorConfiguration>(`http://${this.modemIp}/api/v1/login_conf`)
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
    const { data } = await axios.get(`http://${this.modemIp}/index.php`, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml',
      },
    })
    const firmwareVersion = extractFirmwareVersion(data as string)
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
      const maybeModem = await Promise.any([this.tryArris(), this.tryTechnicolor()])
      if (!maybeModem) {
        throw new Error('Modem discovery was unsuccessful')
      }
      return maybeModem
    } catch (error) {
      this.logger.warn('Could not find a router/modem under the known addresses')
      throw error
    }
  }
}
