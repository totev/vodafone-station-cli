import {Log} from '../logger'
import {DocsisStatus, HumanizedDocsis31ChannelStatus, HumanizedDocsisChannelStatus, Modem, DocsisChannelType} from './modem'
import {decrypt, deriveKey, encrypt} from './tools/crypto'
import {CryptoVars, extractCredentialString, extractCryptoVars, extractDocsisStatus} from './tools/html-parser'

export interface ArrisDocsisStatus {
  downstream: ArrisDocsisChannelStatus[];
  upstream: ArrisDocsisChannelStatus[];
  downstreamChannels: number;
  upstreamChannels: number;
  ofdmChannels: number;
  time: string;
}

export interface ArrisDocsisChannelStatus {
  ChannelID: string;
  ChannelType: DocsisChannelType;
  Frequency: string|number;
  Modulation: string;
  PowerLevel: string;
  SNRLevel?: string | number;
  LockStatus: string;
}

export interface SetPasswordRequest {
  AuthData: string;
  EncryptData: string;
  Name: string;
}

export interface SetPasswordResponse {
  p_status: string;
  encryptData: string;
  p_waitTime?: number;
}

export function normalizeChannelStatus(channelStatus: ArrisDocsisChannelStatus): HumanizedDocsisChannelStatus | HumanizedDocsis31ChannelStatus {
  const frequency: Record<string, number> = {}
  if (channelStatus.ChannelType === 'SC-QAM') {
    frequency.frequency = channelStatus.Frequency as number
  }

  if (['OFDM', 'OFDMA'].includes(channelStatus.ChannelType)) {
    const ofdmaFrequency = String(channelStatus.Frequency).split('~')
    frequency.frequencyStart = Number(ofdmaFrequency[0])
    frequency.frequencyEnd = Number(ofdmaFrequency[1])
  }

  return {
    channelId: channelStatus.ChannelID,
    channelType: channelStatus.ChannelType,
    modulation: channelStatus.Modulation,
    powerLevel: parseFloat(channelStatus.PowerLevel.split('/')[1]),
    lockStatus: channelStatus.LockStatus,
    snr: parseInt(`${channelStatus.SNRLevel ?? 0}`, 10),
    ...frequency
  } as HumanizedDocsisChannelStatus | HumanizedDocsis31ChannelStatus
}

export function normalizeDocsisStatus(arrisDocsisStatus: ArrisDocsisStatus): DocsisStatus {
  const result: DocsisStatus = {
    downstream: [],
    downstreamOfdm: [],
    upstream: [],
    upstreamOfdma: [],
    time: arrisDocsisStatus.time
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

  async logout(): Promise<void> {
    try {
      this.logger.log('Logging out...')
      return  this.httpClient.post('/php/logout.php')
    } catch (error) {
      this.logger.error('Could not do a full session logout', error)
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
      deriveKey(password, cryptoVars.salt)
    )
    this.logger.debug('Csrf nonce: ', csrfNonce)

    await this.addCredentialToCookie()
    this.csrfNonce = csrfNonce
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

  encryptPassword(
    password: string,
    cryptoVars: CryptoVars
  ): SetPasswordRequest {
    const jsData =
    '{"Password": "' + password + '", "Nonce": "' + cryptoVars.sessionId + '"}'
    const key = deriveKey(password, cryptoVars.salt)
    const authData = 'loginPassword'
    const encryptData = encrypt(key, jsData, cryptoVars.iv, authData)

    return {
      EncryptData: encryptData,
      Name: Modem.USERNAME,
      AuthData: authData,
    }
  }

  loginPasswordCheck(
    encryptedData: string,
    cryptoVars: CryptoVars,
    key: string
  ): string {
    const csrfNonce = decrypt(key, encryptedData, cryptoVars.iv, 'nonce')
    return csrfNonce
  }

  async  createServerRecord(
    setPasswordRequest: SetPasswordRequest
  ): Promise<SetPasswordResponse> {
    try {
      const {data} = await this.httpClient.post<SetPasswordResponse>(
        '/php/ajaxSet_Password.php',
        setPasswordRequest
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

  async addCredentialToCookie(): Promise<void> {
    const credential = await this.fetchCredential()
    this.logger.debug('Credential: ', credential)
    // set obligatory static cookie
    this.cookieJar.setCookie(`credential= ${credential}`, `http://${this.modemIp}`)
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

  async docsis(): Promise<DocsisStatus> {
    if (!this.csrfNonce) {
      throw new Error('A valid csrfNonce is required in order to query the modem.')
    }
    try {
      const {data} = await this.httpClient.get('/php/status_docsis_data.php', {
        headers: {
          csrfNonce: this.csrfNonce,
          Referer: `http://${this.modemIp}/?status_docsis&mid=StatusDocsis`,
          Connection: 'keep-alive',
        },
      })
      return normalizeDocsisStatus(extractDocsisStatus(data as string))
    } catch (error) {
      this.logger.error('Could not fetch remote docsis status', error)
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
            csrfNonce: this.csrfNonce,
            Referer: `http://${this.modemIp}/?status_docsis&mid=StatusDocsis`,
            Connection: 'keep-alive',
          },
        }
      )
      this.logger.log('Router is restarting')
      return data
    } catch (error) {
      this.logger.error('Could not restart router.', error)
      throw error
    }
  }
}

