import axios, {AxiosInstance} from 'axios'
import axiosCookieJarSupport from 'axios-cookiejar-support'
import {CookieJar} from 'tough-cookie'
import {Log} from './logger'

// axios cookie support
axiosCookieJarSupport(axios)

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

  constructor(private readonly modemIp: string, private readonly logger: Log) {
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

  async restart(csrfNonce: string): Promise<any> {
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
      this.logger.log('Router is restarting')
      return data
    } catch (error) {
      this.logger.error('Could not restart router.', error)
      throw error
    }
  }
}
