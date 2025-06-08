import axios, {AxiosInstance} from 'axios';
import {wrapper} from 'axios-cookiejar-support';
import {CookieJar} from 'tough-cookie';

import {Log} from '../logger';

export type DocsisChannelType = 'OFDM' | 'OFDMA' | 'SC-QAM'

export type Modulation = '16QAM' | '64QAM' | '256QAM' | '1024QAM' | '2048QAM' | '4096QAM'

export type Protocol = 'TCP' | 'UDP'

export interface HumanizedDocsisChannelStatus {
  channelId: string;
  channelType: DocsisChannelType;
  frequency: number; // MHz
  lockStatus: string;
  modulation: Modulation;
  powerLevel: number; // dBmV
  snr: number; // dB
}

export interface DiagnosedDocsisChannelStatus extends HumanizedDocsisChannelStatus {
  diagnose: Diagnose
}
export interface DiagnosedDocsis31ChannelStatus extends HumanizedDocsis31ChannelStatus {
  diagnose: Diagnose
}

export interface Diagnose {
  color: 'green' | 'red' | 'yellow'
  description: string;
  deviation: boolean
}

export interface HumanizedDocsis31ChannelStatus extends Omit<HumanizedDocsisChannelStatus, 'frequency'> {
  frequencyEnd: number;// MHz
  frequencyStart: number;// MHz
}

export interface DocsisStatus {
  downstream: HumanizedDocsisChannelStatus[];
  downstreamOfdm: HumanizedDocsis31ChannelStatus[];
  time: string;
  upstream: HumanizedDocsisChannelStatus[];
  upstreamOfdma: HumanizedDocsis31ChannelStatus[];
}

export interface DiagnosedDocsisStatus {
  downstream: DiagnosedDocsisChannelStatus[];
  downstreamOfdm: DiagnosedDocsis31ChannelStatus[];
  time: string;
  upstream: DiagnosedDocsisChannelStatus[];
  upstreamOfdma: DiagnosedDocsis31ChannelStatus[];
}

export interface ExposedHostSettings {
  enabled: boolean;
  endPort: number;
  index: number;
  mac: string;
  protocol: Protocol;
  serviceName: string;
  startPort: number;
}

export interface HostExposureSettings {
  hosts: ExposedHostSettings[];
}

export interface GenericModem {
  docsis(): Promise<DocsisStatus>;
  getHostExposure(): Promise<HostExposureSettings>;
  login(password: string): Promise<void>;
  logout(): Promise<void>;
  restart(): Promise<unknown>;
}

export abstract class Modem implements GenericModem {
  static USERNAME = 'admin'
  protected readonly cookieJar: CookieJar
  protected readonly httpClient: AxiosInstance

  constructor(protected readonly modemIp: string, protected readonly logger: Log) {
    this.cookieJar = new CookieJar()
    this.httpClient = this.initAxios()
  }

  docsis(): Promise<DocsisStatus> {
    throw new Error('Method not implemented.')
  }

  getHostExposure(): Promise<HostExposureSettings> {
    throw new Error('Method not implemented.')
  }

  login(_password: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  logout(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  restart(): Promise<unknown> {
    throw new Error('Method not implemented.')
  }

  setHostExposure(_: HostExposureSettings): Promise<void> {
    throw new Error('Method not implemented.')
  }

  private initAxios(): AxiosInstance {
    return wrapper(axios.create({
      baseURL: `http://${this.modemIp}`,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      jar: this.cookieJar,
      timeout: 45_000,
      withCredentials: true,
    }))
  }
}

export function normalizeModulation(modulation: string): Modulation {
  let normalizedModulation = modulation;
  if (modulation.match('/')) {
    return normalizeModulation(modulation.split('/')[0]);
  }

  if (modulation.match('-')) {
    normalizedModulation = modulation.split('-').join('');
  }

  if (modulation.match(' ')) {
    normalizedModulation = modulation.split(' ').join('');
  }

  return normalizedModulation.toUpperCase() as Modulation;
}
