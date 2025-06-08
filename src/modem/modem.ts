import axios, {AxiosInstance} from 'axios'
import {HttpsCookieAgent} from 'http-cookie-agent/http'
import {CookieJar} from 'tough-cookie'

import type {Protocol as HttpProtocol} from './discovery'

import {Log} from '../logger'

export type DocsisChannelType = 'OFDM' | 'OFDMA' | 'SC-QAM'

export type Modulation = '16QAM' | '32QAM' | '64QAM' | '256QAM' | '1024QAM' | '2048QAM' | '4096QAM' | 'QPSK'

export type Protocol = 'TCP' | 'UDP'

export interface HumanizedDocsisChannelStatus {
  channelId: string
  channelType: DocsisChannelType
  frequency: number // MHz
  lockStatus: string
  modulation: Modulation
  powerLevel: number // dBmV
  snr: number // dB
}

export interface DiagnosedDocsisChannelStatus
  extends HumanizedDocsisChannelStatus {
  diagnose: Diagnose
}
export interface DiagnosedDocsis31ChannelStatus
  extends HumanizedDocsis31ChannelStatus {
  diagnose: Diagnose
}

export interface Diagnose {
  color: 'green' | 'red' | 'yellow'
  description: string
  deviation: boolean
}

export interface HumanizedDocsis31ChannelStatus extends Omit<HumanizedDocsisChannelStatus, 'frequency'> {
  frequencyEnd: number // MHz
  frequencyStart: number // MHz
}

export interface DocsisStatus {
  downstream: HumanizedDocsisChannelStatus[]
  downstreamOfdm: HumanizedDocsis31ChannelStatus[]
  time: string
  upstream: HumanizedDocsisChannelStatus[]
  upstreamOfdma: HumanizedDocsis31ChannelStatus[]
}

export interface DiagnosedDocsisStatus {
  downstream: DiagnosedDocsisChannelStatus[]
  downstreamOfdm: DiagnosedDocsis31ChannelStatus[]
  time: string
  upstream: DiagnosedDocsisChannelStatus[]
  upstreamOfdma: DiagnosedDocsis31ChannelStatus[]
}

export interface ExposedHostSettings {
  enabled: boolean
  endPort: number
  index: number
  mac: string
  protocol: Protocol
  serviceName: string
  startPort: number
}

export interface HostExposureSettings {
  hosts: ExposedHostSettings[]
}

export interface GenericModem {
  docsis(): Promise<DocsisStatus>
  getHostExposure(): Promise<HostExposureSettings>
  login(password: string): Promise<void>
  logout(): Promise<void>
  restart(): Promise<unknown>
}

export abstract class Modem implements GenericModem {
  static USERNAME = 'admin'
  protected readonly cookieJar: CookieJar
  protected readonly httpClient: AxiosInstance

  constructor(
    protected readonly modemIp: string,
    protected readonly protocol: HttpProtocol,
    protected readonly logger: Log,
  ) {
    this.cookieJar = new CookieJar()
    this.httpClient = this.initAxios()
  }

  get baseUrl(): string {
    return `${this.protocol}://${this.modemIp}`
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
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      httpAgent: new HttpsCookieAgent({
        cookies: {jar: this.cookieJar},
        keepAlive: true,
        rejectUnauthorized: false, // disable CA checks
      }),
      httpsAgent: new HttpsCookieAgent({
        cookies: {jar: this.cookieJar},
        keepAlive: true,
        rejectUnauthorized: false, // the modems have a self signed ssl certificate
      }),
      timeout: 45_000,
      withCredentials: true,
    })
  }
}

export function normalizeModulation(modulation: string): Modulation {
  let normalizedModulation = modulation

  // Handle slash-separated values by taking the first one
  if (modulation.includes('/')) {
    return normalizeModulation(modulation.split('/')[0])
  }

  // Remove dashes and spaces
  if (modulation.includes('-')) {
    normalizedModulation = modulation.split('-').join('')
  }

  if (modulation.includes(' ')) {
    normalizedModulation = modulation.split(' ').join('')
  }

  // Convert to uppercase
  normalizedModulation = normalizedModulation.toUpperCase()

  // Handle formats like "QAM256" -> "256QAM"
  if (normalizedModulation.startsWith('QAM') && normalizedModulation.length > 3) {
    const number = normalizedModulation.slice(3)
    normalizedModulation = `${number}QAM`
  }

  // Validate against known modulations
  const validModulations: Modulation[] = ['16QAM', '32QAM', '64QAM', '256QAM', '1024QAM', '2048QAM', '4096QAM', 'QPSK']

  if (validModulations.includes(normalizedModulation as Modulation)) {
    return normalizedModulation as Modulation
  }

  throw new Error(`Unknown modulation ${modulation}`)
}
