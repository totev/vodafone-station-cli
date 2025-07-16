import axios, {AxiosResponse} from 'axios';

import {Log} from '../logger';
import {TechnicolorConfiguration} from './technicolor-modem';
import {extractFirmwareVersion} from './tools/html-parser';

// Default IP addresses - can be overridden via CLI flags or environment variables
const DEFAULT_BRIDGED_MODEM_IP = '192.168.100.1';
const DEFAULT_ROUTER_IP = '192.168.0.1';

axios.defaults.timeout = 10_000;

interface ModemLocation {
  ipAddress: string;
  protocol: Protocol;
}

export interface DiscoveryOptions {
  ip?: string;
}

export async function discoverModemLocation(options: DiscoveryOptions = {}): Promise<ModemLocation> {
  let defaultIps = [DEFAULT_BRIDGED_MODEM_IP, DEFAULT_ROUTER_IP];
  // If specific IP is provided, only try that IP
  if (options.ip) {
    defaultIps = [options.ip];
  }

  try {
    const headRequests = [];
    for (const ip of defaultIps) {
      headRequests.push(
        axios.head(`http://${ip}`),
        axios.head(`https://${ip}`),
      );
    }

    const results = await Promise.allSettled(headRequests);
    const maybeResult = results.find(result => result.status === 'fulfilled') as undefined | {value: AxiosResponse};
    if (maybeResult?.value.request?.host) {
      return {
        ipAddress: maybeResult?.value.request?.host,
        protocol: maybeResult?.value.request?.protocol.replace(':', '') as Protocol,
      };
    }

    throw new Error('Could not find a router/modem under the known addresses.');
  } catch (error) {
    console.error('Could not find a router/modem under the known addresses.');
    throw error;
  }
}

export type Protocol = 'http' | 'https';

export interface ModemInformation {
  deviceType: 'Arris' | 'Technicolor';
  firmwareVersion: string;
  ipAddress: string;
  protocol: Protocol;
}

export class ModemDiscovery {
  constructor(
    private readonly modemLocation: ModemLocation,
    private readonly logger: Log,
  ) {}

  async discover(): Promise<ModemInformation> {
    try {
      const maybeModem = await Promise.any([
        this.tryArris(),
        this.tryTechnicolor(),
      ]);
      if (!maybeModem) {
        throw new Error('Modem discovery was unsuccessful');
      }

      return maybeModem;
    } catch (error) {
      this.logger.warn('Could not find a router/modem under the known addresses');
      throw error;
    }
  }

  async tryArris(): Promise<ModemInformation> {
    const {ipAddress, protocol} = this.modemLocation;

    const {data} = await axios.get(`${protocol}://${ipAddress}/index.php`, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml',
      },
    });
    const firmwareVersion = extractFirmwareVersion(data as string);
    if (!firmwareVersion) {
      throw new Error('Unable to parse firmware version.');
    }

    return {
      deviceType: 'Arris',
      firmwareVersion,
      ipAddress,
      protocol,
    };
  }

  async tryTechnicolor(): Promise<ModemInformation> {
    const {ipAddress, protocol} = this.modemLocation;
    const {data} = await axios.get<TechnicolorConfiguration>(`${protocol}://${ipAddress}/api/v1/login_conf`);
    this.logger.debug(`Technicolor login configuration: ${JSON.stringify(data)}`);
    if (data.error === 'ok' && data.data?.firmwareversion) {
      return {
        deviceType: 'Technicolor',
        firmwareVersion: data.data.firmwareversion,
        ipAddress,
        protocol,
      };
    }

    throw new Error('Could not determine modem type');
  }
}
