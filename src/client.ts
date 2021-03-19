import axios, {AxiosInstance} from 'axios'
import axiosCookieJarSupport from 'axios-cookiejar-support'
import {CookieJar} from 'tough-cookie'
import {decrypt, deriveKey, encrypt} from './crypto'
import {
  CryptoVars,
  DocsisStatus,
  extractCredentialString,
  extractCryptoVars,
  extractDocsisStatus,
} from './html-parser'

// axios cookie support
axiosCookieJarSupport(axios)

const USERNAME = 'admin'

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

export class CliClient {
  private readonly cookieJar: CookieJar

  private readonly httpClient: AxiosInstance

  constructor(private readonly modemIp: string) {
    this.cookieJar = new CookieJar()
    this.httpClient = this.initAxios()
  }

  initAxios(): AxiosInstance {
    return axios.create({
      withCredentials: true,
      jar: this.cookieJar,
      baseURL: `http://${this.modemIp}`,
    })
  }

  async  login(password: string) {
    const cryptoVars = await this.getCurrentCryptoVars()
    const encPw = this.encryptPassword(password, cryptoVars)
    console.debug('Encrypted password: ', encPw)
    const serverSetPassword = await this.createServerRecord(encPw)
    console.debug('ServerSetPassword: ', serverSetPassword)

    const csrfNonce = this.loginPasswordCheck(
      serverSetPassword.encryptData,
      cryptoVars,
      deriveKey(password, cryptoVars.salt)
    )
    console.debug('Csrf nonce: ', csrfNonce)

    await this.addCredentialToCookie()
    return csrfNonce
  }

  async  getCurrentCryptoVars(): Promise<CryptoVars> {
    try {
      const {data} = await this.httpClient.get('/', {
        headers: {Accept: 'text/html,application/xhtml+xml,application/xml'},
      })
      const cryptoVars = extractCryptoVars(data)
      console.debug('Parsed crypto vars: ', cryptoVars)
      return cryptoVars
    } catch (error) {
      console.error('Could not get the index page from the router', error)
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
      Name: USERNAME,
      AuthData: authData,
    }
  }

  loginPasswordCheck(
    encryptedData: string,
    cryptoVars: CryptoVars,
    key: string
  ): string {
    const csrf_nonce = decrypt(key, encryptedData, cryptoVars.iv, 'nonce')
    return csrf_nonce
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
      console.error('Could not set password on remote router.', error)
      throw error
    }
  }

  async addCredentialToCookie() {
    const credential = await this.fetchCredential()
    console.debug('Credential: ', credential)
    // set obligatory static cookie
    this.cookieJar.setCookie(`credential= ${credential}`, `http://${this.modemIp}`)
  }

  async  fetchCredential(): Promise<string> {
    try {
      const {data} = await this.httpClient.get('/base_95x.js')
      return extractCredentialString(data)
    } catch (error) {
      console.error('Could not fetch credential.', error)
      throw error
    }
  }

  async fetchDocsisStatus(
    csrfNonce: string
  ): Promise<DocsisStatus> {
    try {
      const {data} = await this.httpClient.get('/php/status_docsis_data.php', {
        headers: {
          csrfNonce,
          Referer: `http://${this.modemIp}/?status_docsis&mid=StatusDocsis`,
          'X-Requested-With': 'XMLHttpRequest',
          Connection: 'keep-alive',
        },
      })
      return extractDocsisStatus(data)
    } catch (error) {
      console.error('Could not fetch remote docsis status'
      )
      throw error
    }
  }

  async restart(csrfNonce: string) {
    try {
      const {data} = await this.httpClient.post(
        'php/ajaxSet_status_restart.php',
        {
          RestartReset: 'Restart',
        },
        {
          headers: {
            csrfNonce,
            Referer: `http://${this.modemIp}/?status_docsis&mid=StatusDocsis`,
            'X-Requested-With': 'XMLHttpRequest',
            Connection: 'keep-alive',
          },
        }
      )
      console.info('Router is restarting')
      return data
    } catch (error) {
      console.error('Could not restart router.', error)
      throw error
    }
  }

  async  logout(): Promise<boolean> {
    try {
      console.info('Logging out...')
      await this.httpClient.post('/php/logout.php')
      return true
    } catch (error) {
      console.error('Could not do a full session logout', error)
      throw error
    }
  }
}

