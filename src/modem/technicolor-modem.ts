import {deriveKeyTechnicolor} from '../crypto'
import {Log} from '../logger'
import {DocsisStatus, Modem} from './modem'

export interface TechnicolorBaseResponse{
  error: string | 'ok' | 'error';
  message: string;
  data?: {[key: string]: unknown};
}

export interface TechnicolorConfiguration extends TechnicolorBaseResponse{
    data: {
        LanMode: 'router' | 'modem';
        DeviceMode: 'Ipv4' | 'Ipv4';
        firmwareversion: string;
        internetipv4: string;
        AFTR: string;
        IPAddressRT: string[];
    };
}

export interface TechnicolorSaltResponse  extends TechnicolorBaseResponse{
    salt: string;
    saltwebui: string;
}

export interface TechnicolorTokenResponse  extends TechnicolorBaseResponse{
    token: string;
}

export class Technicolor extends Modem {
  constructor(readonly modemIp: string, readonly logger: Log) {
    super(modemIp, logger)
  }

  async login(password: string): Promise<void> {
    try {
      const {data: salt} = await this.httpClient.post<TechnicolorSaltResponse>('/api/v1/session/login', `username=${Modem.USERNAME}&password=seeksalthash`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
      })
      this.logger.debug('Salt', salt)

      if (salt.message && salt.message === 'MSG_LOGIN_150') {
        throw new Error('A user is already logged in')
      }

      const derivedKey = deriveKeyTechnicolor(deriveKeyTechnicolor(password, salt.salt), salt.saltwebui)
      this.logger.debug('Derived key', derivedKey)
      const {data: loginResponse} = await this.httpClient.post<TechnicolorBaseResponse>('/api/v1/session/login', `username=${Modem.USERNAME}&password=${derivedKey}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      })
      this.logger.debug('Login status', loginResponse)
    } catch (error) {
      this.logger.warn(`Something went wrong with the login ${error}`)
    }
  }

  async docsis(): Promise<DocsisStatus> {
    const {data: docsisStatus} = await this.httpClient.get('/api/v1/sta_docsis_status')
    return docsisStatus
  }

  async logout(): Promise<void> {
    this.logger.debug('Logging outB...')
    return this.httpClient.post('api/v1/session/logout')
  }

  async restart(): Promise<unknown> {
    const {data: tokenResponse} = await this.httpClient.get<TechnicolorTokenResponse>('api/v1/session/init_page')
    this.logger.debug('Token response: ', tokenResponse)
    const {data: restartResponse} = await this.httpClient.post<TechnicolorBaseResponse>('api/v1/sta_restart',
      'restart=Router%2CWifi%2CVoIP%2CDect%2CMoCA', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-CSRF-TOKEN': tokenResponse.token,
        },
      })

    if (restartResponse?.error === 'error') {
      this.logger.debug(restartResponse)
      throw new Error(`Could not restart router: ${restartResponse.message}`)
    }
    return restartResponse
  }
}

