import {decrypt, deriveKey, encrypt} from '../crypto'
import {CryptoVars, extractCredentialString, extractCryptoVars, extractDocsisStatus} from '../html-parser'
import {Log} from '../logger'
import {DocsisStatus, Modem} from '../modem'

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
      const cryptoVars = extractCryptoVars(data)
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
      return data
    } catch (error) {
      this.logger.error('Could not set password on remote router.', error)
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
      return extractCredentialString(data)
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
          'X-Requested-With': 'XMLHttpRequest',
          Connection: 'keep-alive',
        },
      })
      return extractDocsisStatus(data)
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
            'X-Requested-With': 'XMLHttpRequest',
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
