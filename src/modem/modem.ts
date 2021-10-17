import axios, {AxiosInstance} from 'axios'
import axiosCookieJarSupport from 'axios-cookiejar-support'
import {CookieJar} from 'tough-cookie'
import {Log} from '../logger'
// axios cookie support
axiosCookieJarSupport(axios)

export type DocsisChannelType = 'OFDM' | 'OFDMA' | 'SC-QAM'

export interface HumanizedDocsisChannelStatus{
  channelId: string;
  channelType: DocsisChannelType;
  snr: number; // dB
  frequency: number; // MHz
  modulation: string;
  lockStatus: string;
  powerLevel: number; // dBmV
}

export interface HumanizedDocsis31ChannelStatus extends Omit<HumanizedDocsisChannelStatus, 'frequency'>{
  frequencyStart: number;// MHz
  frequencyEnd: number;// MHz
}

export interface DocsisStatus{
  downstream: HumanizedDocsisChannelStatus[];
  downstreamOfdm: HumanizedDocsis31ChannelStatus[];
  upstream: HumanizedDocsisChannelStatus[];
  upstreamOfdma: HumanizedDocsis31ChannelStatus[];
  time: string;
}

export interface GenericModem{
  logout(): Promise<void>;
  login(password: string): Promise<void>;
  docsis(): Promise<DocsisStatus>;
  restart(): Promise<unknown>;
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

  logout(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  private initAxios(): AxiosInstance {
    return axios.create({
      withCredentials: true,
      jar: this.cookieJar,
      baseURL: `http://${this.modemIp}`,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: 30000
    })
  }
}

