import axios, {AxiosInstance} from 'axios'
import axiosCookieJarSupport from 'axios-cookiejar-support'
import {CookieJar} from 'tough-cookie'
import {Log} from './logger'

// axios cookie support
axiosCookieJarSupport(axios)

export interface GenericModem{
  logout(): Promise<void>;
  login(password: string): Promise<void>;
}

export abstract class Modem implements GenericModem {
  protected readonly cookieJar: CookieJar
  protected readonly httpClient: AxiosInstance
  static USERNAME = 'admin'

  constructor(protected readonly modemIp: string, protected readonly logger: Log) {
    this.cookieJar = new CookieJar()
    this.httpClient = this.initAxios()
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

