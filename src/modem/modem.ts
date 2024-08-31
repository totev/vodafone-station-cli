import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { Log } from '../logger';

export type DocsisChannelType = 'OFDM' | 'OFDMA' | 'SC-QAM'

export type Modulation = "16QAM" | "64QAM" | "256QAM" | "1024QAM" | "2048QAM" | "4096QAM"

export type Protocol = "TCP" | "UDP"

export interface HumanizedDocsisChannelStatus {
  channelId: string;
  channelType: DocsisChannelType;
  snr: number; // dB
  frequency: number; // MHz
  modulation: Modulation;
  lockStatus: string;
  powerLevel: number; // dBmV
}

export interface DiagnosedDocsisChannelStatus extends HumanizedDocsisChannelStatus {
  diagnose: Diagnose
}
export interface DiagnosedDocsis31ChannelStatus extends HumanizedDocsis31ChannelStatus {
  diagnose: Diagnose
}

export interface Diagnose {
  deviation: boolean
  color: "red" | "green" | "yellow"
  description: string;
}

export interface HumanizedDocsis31ChannelStatus extends Omit<HumanizedDocsisChannelStatus, 'frequency'> {
  frequencyStart: number;// MHz
  frequencyEnd: number;// MHz
}

export interface DocsisStatus {
  downstream: HumanizedDocsisChannelStatus[];
  downstreamOfdm: HumanizedDocsis31ChannelStatus[];
  upstream: HumanizedDocsisChannelStatus[];
  upstreamOfdma: HumanizedDocsis31ChannelStatus[];
  time: string;
}

export interface DiagnosedDocsisStatus {
  downstream: DiagnosedDocsisChannelStatus[];
  downstreamOfdm: DiagnosedDocsis31ChannelStatus[];
  upstream: DiagnosedDocsisChannelStatus[];
  upstreamOfdma: DiagnosedDocsis31ChannelStatus[];
  time: string;
}

export interface ExposedHostSettings {
  serviceName: string;
  mac: string;
  protocol: Protocol;
  startPort: number;
  endPort: number;
  enabled: boolean;
  index: number;
}

export interface HostExposureSettings {
  hosts: ExposedHostSettings[];
}

export interface GenericModem {
  logout(): Promise<void>;
  login(password: string): Promise<void>;
  firewall(status?: boolean): Promise<void>;
  docsis(): Promise<DocsisStatus>;
  restart(): Promise<unknown>;
  getHostExposure(): Promise<HostExposureSettings>;
}

export abstract class Modem implements GenericModem {
  protected readonly cookieJar: CookieJar
  protected readonly httpClient: AxiosInstance
  static USERNAME = 'admin'

  constructor(protected readonly modemIp: string, protected readonly logger: Log) {
    this.cookieJar = new CookieJar()
    this.httpClient = this.initAxios()
  }
  restart(): Promise<unknown> {
    throw new Error('Method not implemented.')
  }

  docsis(): Promise<DocsisStatus> {
    throw new Error('Method not implemented.')
  }

  login(_password: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  firewall(_status: boolean = true): Promise<void> {
    throw new Error('Method not implemented.')
  }

  logout(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  getHostExposure(): Promise<HostExposureSettings> {
    throw new Error('Method not implemented.')
  }

  setHostExposure(_: HostExposureSettings): Promise<void> {
    throw new Error('Method not implemented.')
  }

  private initAxios(): AxiosInstance {
    return wrapper(axios.create({
      withCredentials: true,
      jar: this.cookieJar,
      baseURL: `http://${this.modemIp}`,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: 45000
    }))
  }
}

export function normalizeModulation(modulation: string): Modulation {
  let normalizedModulation = modulation;
  if (modulation.match("/")) {
    return normalizeModulation(modulation.split("/")[0]);
  }
  if (modulation.match("-")) {
    normalizedModulation = modulation.split("-").join("");
  }
  if (modulation.match(" ")) {
    normalizedModulation = modulation.split(" ").join("");
  }
  return normalizedModulation.toUpperCase() as Modulation;
}
