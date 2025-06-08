import {Log} from '../logger'
import {BAD_MODEM_POWER_LEVEL} from './constants';
import {
  DocsisChannelType, DocsisStatus, ExposedHostSettings, HostExposureSettings, HumanizedDocsis31ChannelStatus, HumanizedDocsisChannelStatus, Modem, Protocol,
} from './modem'
import {decrypt, deriveKey, encrypt} from './tools/crypto'
import {
  CryptoVars, extractCredentialString, extractCryptoVars, extractDocsisStatus,
} from './tools/html-parser'

export interface ArrisDocsisStatus {
  downstream: ArrisDocsisChannelStatus[];
  downstreamChannels: number;
  ofdmChannels: number;
  time: string;
  upstream: ArrisDocsisChannelStatus[];
  upstreamChannels: number;
}

export interface ArrisDocsisChannelStatus {
  ChannelID: string;
  ChannelType: DocsisChannelType;
  Frequency: number | string;
  LockStatus: string;
  Modulation: string;
  PowerLevel: string;
  SNRLevel?: number | string;
}

export interface SetPasswordRequest {
  AuthData: string;
  EncryptData: string;
  Name: string;
}

export interface SetPasswordResponse {
  encryptData: string;
  p_status: string;
  p_waitTime?: number;
}

interface ArrisGetHostExposureSettings {
  dhcpclient: any;
  hostExposure: ArrisGetExposedHostSettings[];
}

interface ArrisGetExposedHostSettings {
  EndPort: number;
  Index: string;
  MAC: string;
  Protocol: Protocol;
  ServiceName: string;
  StartPort: number;
  Status: string;
}

interface ArrisSetHostExposureSettings {
  hEditRule: ArrisSetExposedHostSettings[];
}

interface ArrisSetExposedHostSettings {
  enable: string;
  endPort: number;
  index: string;
  macAddress: string;
  name: string;
  protocol: Protocol;
  startPort: number;
}

export function normalizeChannelStatus(channelStatus: ArrisDocsisChannelStatus): HumanizedDocsis31ChannelStatus | HumanizedDocsisChannelStatus {
  const frequency: Record<string, number> = {}
  if (channelStatus.ChannelType === 'SC-QAM') {
    frequency.frequency = channelStatus.Frequency as number
  }

  if (['OFDM', 'OFDMA'].includes(channelStatus.ChannelType)) {
    const ofdmaFrequency = String(channelStatus.Frequency).split('~')
    frequency.frequencyStart = Number(ofdmaFrequency[0])
    frequency.frequencyEnd = Number(ofdmaFrequency[1])
  }

  const powerLevel = Number.parseFloat(channelStatus.PowerLevel.split('/')[0]);
  const snr = Number.parseInt(`${channelStatus.SNRLevel ?? 0}`, 10);
  return {
    channelId: channelStatus.ChannelID,
    channelType: channelStatus.ChannelType,
    lockStatus: channelStatus.LockStatus,
    modulation: channelStatus.Modulation,
    powerLevel: isNaN(powerLevel) ? BAD_MODEM_POWER_LEVEL : powerLevel,
    snr: isNaN(snr) ? 0 : snr,
    ...frequency,
  } as HumanizedDocsis31ChannelStatus | HumanizedDocsisChannelStatus
}

export function normalizeDocsisStatus(arrisDocsisStatus: ArrisDocsisStatus): DocsisStatus {
  const result: DocsisStatus = {
    downstream: [],
    downstreamOfdm: [],
    time: arrisDocsisStatus.time,
    upstream: [],
    upstreamOfdma: [],
  }
  result.downstream = arrisDocsisStatus.downstream
    .filter(downstream => downstream.ChannelType === 'SC-QAM')
    .map(normalizeChannelStatus) as HumanizedDocsisChannelStatus[]

  result.downstreamOfdm = arrisDocsisStatus.downstream
    .filter(downstream => downstream.ChannelType === 'OFDM')
    .map(normalizeChannelStatus) as HumanizedDocsis31ChannelStatus[]

  result.upstream = arrisDocsisStatus.upstream
    .filter(upstream => upstream.ChannelType === 'SC-QAM')
    .map(normalizeChannelStatus) as HumanizedDocsisChannelStatus[]

  result.upstreamOfdma = arrisDocsisStatus.upstream
    .filter(upstream => upstream.ChannelType === 'OFDMA')
    .map(normalizeChannelStatus) as HumanizedDocsis31ChannelStatus[]
  return result
}

export class Arris extends Modem {
  private csrfNonce = ''

  constructor(readonly modemIp: string, readonly logger: Log) {
    super(modemIp, logger)
  }

  _convertGetExposedHostSettings(settings: ArrisGetExposedHostSettings): ExposedHostSettings {
    return {
      enabled: settings.Status === 'Enabled',
      endPort: settings.EndPort,
      index: Number.parseInt(settings.Index),
      mac: settings.MAC,
      protocol: settings.Protocol,
      serviceName: settings.ServiceName,
      startPort: settings.StartPort,
    } as ExposedHostSettings
  }

  _convertSetExposedHostSettings(settings: ExposedHostSettings): ArrisSetExposedHostSettings {
    return {
      enable: settings.enabled ? 'Enabled' : 'Disabled',
      endPort: settings.endPort,
      index: settings.index.toString(),
      macAddress: settings.mac,
      name: settings.serviceName,
      protocol: settings.protocol,
      startPort: settings.startPort,
    }
  }

  async addCredentialToCookie(): Promise<void> {
    const credential = await this.fetchCredential()
    this.logger.debug('Credential: ', credential)
    // set obligatory static cookie
    this.cookieJar.setCookie(`credential= ${credential}`, `http://${this.modemIp}`)
  }

  async  createServerRecord(setPasswordRequest: SetPasswordRequest): Promise<SetPasswordResponse> {
    try {
      const {data} = await this.httpClient.post<SetPasswordResponse>(
        '/php/ajaxSet_Password.php',
        setPasswordRequest,
      )
      // TODO handle wrong password case
      // { p_status: 'Lockout', p_waitTime: 1 }
      if (data.p_status === 'Lockout') {
        throw new Error(`Remote user locked out for: ${data.p_waitTime}s`)
      }

      return data
    } catch (error) {
      this.logger.error('Could not pass password on remote router.', error)
      throw error
    }
  }

  async docsis(): Promise<DocsisStatus> {
    if (!this.csrfNonce) {
      throw new Error('A valid csrfNonce is required in order to query the modem.')
    }

    try {
      const {data} = await this.httpClient.get('/php/status_docsis_data.php', {
        headers: {
          Connection: 'keep-alive',
          csrfNonce: this.csrfNonce,
          Referer: `http://${this.modemIp}/?status_docsis&mid=StatusDocsis`,
        },
      })
      return normalizeDocsisStatus(extractDocsisStatus(data as string))
    } catch (error) {
      this.logger.error('Could not fetch remote docsis status', error)
      throw error
    }
  }

  encryptPassword(
    password: string,
    cryptoVars: CryptoVars,
  ): SetPasswordRequest {
    const jsData
    = '{"Password": "' + password + '", "Nonce": "' + cryptoVars.sessionId + '"}'
    const key = deriveKey(password, cryptoVars.salt)
    const authData = 'loginPassword'
    const encryptData = encrypt(key, jsData, cryptoVars.iv, authData)

    return {
      AuthData: authData,
      EncryptData: encryptData,
      Name: Modem.USERNAME,
    }
  }

  async  fetchCredential(): Promise<string> {
    try {
      const {data} = await this.httpClient.get('/base_95x.js')
      return extractCredentialString(data as string)
    } catch (error) {
      this.logger.error('Could not fetch credential.', error)
      throw error
    }
  }

  async  getCurrentCryptoVars(): Promise<CryptoVars> {
    try {
      const {data} = await this.httpClient.get('/', {
        headers: {Accept: 'text/html,application/xhtml+xml,application/xml'},
      })
      const cryptoVars = extractCryptoVars(data as string)
      this.logger.debug('Parsed crypto vars: ', cryptoVars)
      return cryptoVars
    } catch (error) {
      this.logger.error('Could not get the index page from the router', error)
      throw error
    }
  }

  async getHostExposure(): Promise<HostExposureSettings> {
    try {
      const {data} = await this.httpClient.get(
        'php/net_ipv6_host_exposure_data.php?{"hostExposure":{},"dhcpclient":{}}',
        {
          headers: {
            Connection: 'keep-alive',
            csrfNonce: this.csrfNonce,
            Referer: `http://${this.modemIp}/?net_ipv6_host_exposure&mid=NetIPv6HostExposure`,
          },
        },
      )
      return {
        hosts: (data as ArrisGetHostExposureSettings)
        .hostExposure.map(this._convertGetExposedHostSettings),
      } as HostExposureSettings
    } catch (error) {
      this.logger.error('Could not get host exposure data:\n', error)
      throw error
    }
  }

  async login(password: string): Promise<void> {
    const cryptoVars = await this.getCurrentCryptoVars()
    const encPw = this.encryptPassword(password, cryptoVars)
    this.logger.debug('Encrypted password: ', encPw)
    const serverSetPassword = await this.createServerRecord(encPw)
    this.logger.debug('ServerSetPassword: ', serverSetPassword)

    const csrfNonce = this.loginPasswordCheck(
      serverSetPassword.encryptData,
      cryptoVars,
      deriveKey(password, cryptoVars.salt),
    )
    this.logger.debug('Csrf nonce: ', csrfNonce)

    await this.addCredentialToCookie()
    this.csrfNonce = csrfNonce
  }

  loginPasswordCheck(
    encryptedData: string,
    cryptoVars: CryptoVars,
    key: string,
  ): string {
    const csrfNonce = decrypt(key, encryptedData, cryptoVars.iv, 'nonce')
    return csrfNonce
  }

  async logout(): Promise<void> {
    try {
      this.logger.log('Logging out...')
      return  this.httpClient.post('/php/logout.php')
    } catch (error) {
      this.logger.error('Could not do a full session logout', error)
      throw error
    }
  }

  async restart(): Promise<unknown> {
    try {
      const {data} = await this.httpClient.post(
        'php/ajaxSet_status_restart.php',
        {
          RestartReset: 'Restart',
        },
        {
          headers: {
            Connection: 'keep-alive',
            csrfNonce: this.csrfNonce,
            Referer: `http://${this.modemIp}/?status_docsis&mid=StatusDocsis`,
          },
        },
      )
      this.logger.log('Router is restarting')
      return data
    } catch (error) {
      this.logger.error('Could not restart router.', error)
      throw error
    }
  }

  async setHostExposure(settings: HostExposureSettings): Promise<void> {
    const convertedSettings
      = {hEditRule: settings.hosts.map(this._convertSetExposedHostSettings)} as ArrisSetHostExposureSettings
    try {
      await this.httpClient.post(
        'php/ajaxSet_net_ipv6_host_exposure_data.php',
        convertedSettings,
        {
          headers: {
            Connection: 'keep-alive',
            csrfNonce: this.csrfNonce,
            Referer: `http://${this.modemIp}/?net_ipv6_host_exposure&mid=NetIPv6HostExposure`,
          },
        },
      )
    } catch (error) {
      console.error('Could not set host exposure data:\n', error)
      throw error
    }
  }
}

