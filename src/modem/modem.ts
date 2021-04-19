import axios, {AxiosInstance} from 'axios'
import axiosCookieJarSupport from 'axios-cookiejar-support'
import {CookieJar} from 'tough-cookie'
import {Log} from '../logger'
// axios cookie support
axiosCookieJarSupport(axios)

export interface DocsisStatus {
  downstream: DocsisChannelStatus[];
  upstream: DocsisChannelStatus[];
  downstreamChannels: number;
  upstreamChannels: number;
  ofdmChannels: number;
  time: string;
}

export interface DocsisChannelStatus {
  ChannelID: string;
  ChannelType: string;
  Frequency: string;
  LockStatus: string;
  Modulation: string;
  PowerLevel: string;
  SNRLevel: string;
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
    })
  }
}

